require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query(`SELECT id FROM jobs WHERE source_name LIKE '%(via RSS)%' OR source_name = 'Indeed' OR source_type = 'api'`);
    const ids = res.rows.map(r => r.id);
    if (ids.length === 0) {
      console.log("No mock jobs found.");
      return;
    }
    
    console.log(`Found ${ids.length} mock jobs to delete:`, ids);

    // Delete related records first
    const apps = await pool.query(`DELETE FROM applications WHERE job_id = ANY($1)`, [ids]);
    console.log(`Deleted ${apps.rowCount} applications`);

    const saves = await pool.query(`DELETE FROM saved_jobs WHERE job_id = ANY($1)`, [ids]);
    console.log(`Deleted ${saves.rowCount} saved_jobs`);

    const jobs = await pool.query(`DELETE FROM jobs WHERE id = ANY($1)`, [ids]);
    console.log(`Deleted ${jobs.rowCount} mock jobs`);

  } finally {
    pool.end();
  }
}
run();
