import { getDb } from "./queries/connection";
import * as schema from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { fetchFeed } from "./rss/fetcher";
import { parseFeedXml, generateJobSlug } from "./rss/parser";
import { scrapeFeed } from "./scraping/index";

function getHoursFromFrequency(frequency: string): number {
  switch (frequency) {
    case "hourly": return 1;
    case "6h": return 6;
    case "12h": return 12;
    case "daily": return 24;
    default: return 6;
  }
}

// Helper to chunk arrays
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function processFeeds(forceSyncId?: number, isManual: boolean = false) {
  console.log(`[Sync] Starting RSS feed sync process...`);
  const db = getDb();
  
  let feedsQuery = db.select().from(schema.feeds).where(eq(schema.feeds.isActive, true));
  const activeFeeds = await feedsQuery;
  const now = new Date();

  // Filter feeds to process
  const feedsToProcess = activeFeeds.filter(feed => {
    if (forceSyncId && feed.id !== forceSyncId) return false;
    
    // Ignore skipped logic if forced or manual
    if (isManual || forceSyncId) return true;

    if (feed.status === 'blocked') {
      console.log(`[Sync] Skipping feed ${feed.id} (${feed.name}) - Status is BLOCKED`);
      return false;
    }

    const hoursSinceLastSync = feed.lastSyncAt 
      ? (now.getTime() - new Date(feed.lastSyncAt).getTime()) / (1000 * 60 * 60)
      : Infinity;
    
    const requiredInterval = getHoursFromFrequency(feed.syncFrequency || "6h");

    if (hoursSinceLastSync < requiredInterval) {
      console.log(`[Sync] Skipping feed ${feed.id} (${feed.name}) - last synced ${hoursSinceLastSync.toFixed(1)}h ago`);
      return false;
    }

    return true;
  });

  // Process feeds in parallel chunks (3 feeds at a time)
  const CONCURRENCY_LIMIT = 3;
  const feedChunks = chunkArray(feedsToProcess, CONCURRENCY_LIMIT);

  for (const chunk of feedChunks) {
    await Promise.allSettled(chunk.map(feed => processSingleFeed(db, feed)));
  }

  console.log(`[Sync] RSS feed sync process completed.`);
}

async function processSingleFeed(db: any, feed: any) {
  console.log(`[Sync] Processing feed ${feed.id} (${feed.name})...`);
  const startTime = new Date();
  let duration = 0;
  let responseCode = null;
  let importedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  
  // Update status to pending
  await updateFeedStatus(db, feed.id, { lastSyncStatus: "pending" });

  try {
    let feedItems = [];

    if (feed.sourceType === "scraping") {
      const scrapeResult = await scrapeFeed(feed.url);
      duration = scrapeResult.duration;
      responseCode = scrapeResult.responseCode;
      feedItems = scrapeResult.items;
    } else {
      const fetchResult = await fetchFeed(feed.url, feed.etag, feed.lastModified);
      duration = fetchResult.duration;
      responseCode = fetchResult.responseCode;

      if (fetchResult.notModified) {
        console.log(`[Sync] Feed ${feed.id} not modified since last sync. Skipping parsing.`);
        // Update feed
        await updateFeedStatus(db, feed.id, {
          status: "healthy",
          lastSyncStatus: "success",
          lastSyncAt: new Date(),
          lastSuccessAt: new Date(),
          consecutiveFailures: 0,
        });

        // Log skipped
        await logFeed(db, feed.id, feed.url, startTime, new Date(), duration, responseCode, 0, 0, 0, null, "skipped");
        return;
      }

      const feedData = await parseFeedXml(fetchResult.xml);
      feedItems = feedData.items;
      
      // Keep etag tracking for RSS
      feed.newEtag = fetchResult.etag;
      feed.newLastModified = fetchResult.lastModified;
    }

    const jobsToInsert = [];

    for (const item of feedItems) {
      if (!item.title || !item.link) continue;

      const companyName = item.company || feed.name;
      const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
      
      const slug = generateJobSlug(item.guid, item.link, item.title, companyName, pubDate);
      const description = item.content || item.contentSnippet || "Aucune description fournie par le flux RSS.";
      const location = item.location || "Maroc"; // Default to Morocco
      
      jobsToInsert.push({
        title: item.title.substring(0, 150),
        slug,
        description,
        sourceType: "rss" as const,
        sourceName: companyName.substring(0, 100),
        sourceUrl: item.link.substring(0, 500),
        location: location.substring(0, 150),
        jobType: "cdi" as const, // Default fallback
        categoryId: feed.categoryId || null,
        status: "active" as const,
        publishedAt: pubDate,
      });
    }

    // Bulk insert with onConflictDoNothing
    const BATCH_SIZE = 50;
    const insertChunks = chunkArray(jobsToInsert, BATCH_SIZE);
    
    for (const jChunk of insertChunks) {
      if (jChunk.length > 0) {
        await db.insert(schema.jobs).values(jChunk).onConflictDoNothing({
          target: schema.jobs.slug,
        });
        importedCount += jChunk.length; 
      }
    }

    console.log(`[Sync] Successfully processed feed ${feed.id}. Added/Checked ${importedCount} jobs.`);
    
    // Update success
    await updateFeedStatus(db, feed.id, {
      status: "healthy",
      lastSyncStatus: "success",
      lastSyncAt: new Date(),
      lastSuccessAt: new Date(),
      jobsImported: sql`${schema.feeds.jobsImported} + ${importedCount}`,
      lastError: null,
      consecutiveFailures: 0,
      etag: feed.newEtag || feed.etag,
      lastModified: feed.newLastModified || feed.lastModified,
      lastResponseTime: duration,
      averageResponseTime: sql`(${schema.feeds.averageResponseTime} + ${duration}) / 2`
    });

    await logFeed(db, feed.id, feed.url, startTime, new Date(), duration, responseCode, importedCount, skippedCount, updatedCount, null, "success");

  } catch (err: any) {
    duration = err.duration || (Date.now() - startTime.getTime());
    console.error(`[Sync] Error parsing feed ${feed.id}:`, err.message);
    
    // Calculate new consecutive failures
    const consecutiveFailures = (feed.consecutiveFailures || 0) + 1;
    let newStatus = "failed";
    let isActive = feed.isActive;
    
    if (consecutiveFailures >= 5) {
      newStatus = "disabled";
      isActive = false; // Auto-disable the feed
      console.log(`[Sync] Feed ${feed.id} auto-disabled due to ${consecutiveFailures} consecutive failures.`);
    } else if (consecutiveFailures >= 3) {
      newStatus = "warning";
    } else if (err.message.includes("timed out")) {
      newStatus = "timeout";
    }

    // Update error
    await updateFeedStatus(db, feed.id, {
      status: newStatus as any,
      isActive,
      lastSyncStatus: "error",
      lastSyncAt: new Date(),
      lastFailureAt: new Date(),
      lastError: err.message || "Unknown parsing error",
      consecutiveFailures,
      lastResponseTime: duration,
    });

    await logFeed(db, feed.id, feed.url, startTime, new Date(), duration, responseCode, 0, 0, 0, err.message, "error");
  }
}

async function updateFeedStatus(db: any, feedId: number, data: any) {
  await db.update(schema.feeds).set({ ...data, updatedAt: new Date() }).where(eq(schema.feeds.id, feedId));
}

async function logFeed(db: any, feedId: number, url: string, startedAt: Date, finishedAt: Date, duration: number, responseCode: number | null, jobsImported: number, jobsSkipped: number, jobsUpdated: number, errorMessage: string | null, status: "success" | "error" | "timeout" | "skipped") {
  try {
    await db.insert(schema.feedLogs).values({
      feedId,
      url,
      startedAt,
      finishedAt,
      duration,
      responseCode,
      jobsImported,
      jobsSkipped,
      jobsUpdated,
      errorMessage,
      status
    });
  } catch (e: any) {
    console.error(`[Sync] Failed to insert log for feed ${feedId}:`, e.message);
  }
}
