import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and } from "drizzle-orm";
import * as dotenv from "dotenv";
import * as schema from "./db/schema.ts";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool, { schema });

try {
  console.log("Testing Drizzle company query...");
  
  // Try the exact query from company-router
  const result = await db
    .select()
    .from(schema.companies)
    .where(eq(schema.companies.status, "approved"));
  
  console.log(`✅ Found ${result.length} approved companies`);
  console.log("First company:", JSON.stringify(result[0], null, 2));
} catch (e) {
  console.error("❌ Error:", e.message);
  console.error("Code:", e.code);
  if (e.cause) console.error("Cause:", e.cause.message);
} finally {
  await pool.end();
}
