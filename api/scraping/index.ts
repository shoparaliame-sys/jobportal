import { scrapeRekruteJobs } from "./rekrute";

export interface ScrapeResult {
  duration: number;
  responseCode: number | null;
  items: any[];
}

export async function scrapeFeed(url: string): Promise<ScrapeResult> {
  const startTime = Date.now();
  let items: any[] = [];
  
  if (url.includes("rekrute.com")) {
    items = await scrapeRekruteJobs();
  } else {
    throw new Error(`No scraper implemented for domain: ${url}`);
  }

  const duration = Date.now() - startTime;
  
  return {
    duration,
    responseCode: 200, // Assuming success if no throw
    items,
  };
}
