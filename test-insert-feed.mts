import { getDb } from "./api/queries/connection";
import * as schema from "./db/schema";

async function main() {
  const db = getDb();
  try {
    const input = {
      name: "emploi.ma",
      url: "https://www.emploi.ma/rss",
      sourceType: "rss" as const,
      syncFrequency: "daily" as const,
    };
    const [feed] = await db.insert(schema.feeds).values(input).returning();
    console.log("Success:", feed);
  } catch (err) {
    console.error("DB Error:", err);
  }
  process.exit(0);
}

main();
