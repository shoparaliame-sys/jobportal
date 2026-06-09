import { processFeeds } from "./api/sync-feeds";
import { getDb } from "./api/queries/connection";

async function main() {
  console.log("Starting test sync...");
  try {
    await processFeeds(7, true);
    console.log("Test sync completed.");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

main();
