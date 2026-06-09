import { getDb } from "./api/queries/connection";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  
  // Insert Rekrute Scraper
  const newFeed = await db.insert(schema.feeds).values({
    name: "Rekrute.com Scraper",
    url: "https://www.rekrute.com/offres.html",
    sourceType: "scraping",
    syncFrequency: "6h",
    isActive: true,
  }).returning();

  console.log("Inserted scraper feed:", newFeed[0].id);

  process.exit(0);
}

main();
