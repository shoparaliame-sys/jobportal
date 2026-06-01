import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  // Check jobs columns
  const jobsColumnsResult = await pool.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'jobs' ORDER BY ordinal_position
  `);
  console.log("Columns in jobs table:");
  jobsColumnsResult.rows.forEach((row, i) => {
    if (i % 3 === 0) console.log("");
    process.stdout.write(row.column_name.padEnd(20));
  });
  console.log("\n");

  // Query jobs with status filter (what the router uses)
  const activeJobs = await pool.query(
    "SELECT id, title, \"job_status\" FROM jobs WHERE \"job_status\" = $1 LIMIT 3",
    ["active"]
  );
  console.log(`Jobs with "active" status: ${activeJobs.rows.length}`);
  if (activeJobs.rows.length > 0) {
    console.log("Sample:", JSON.stringify(activeJobs.rows[0], null, 2));
  }
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await pool.end();
}
