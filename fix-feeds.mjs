import 'dotenv/config';
import { Pool } from 'pg';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

async function fixFeeds() {
  try {
    // Add unique constraint to feeds.url
    console.log('Adding unique constraint to feeds.url...');
    await pool.query('ALTER TABLE "feeds" ADD CONSTRAINT "feeds_url_unique" UNIQUE("url");');
    console.log('✅ Done\n');
  } catch (err) {
    if (err.code === '42P07') {
      console.log('✅ Constraint already exists\n');
    } else {
      console.error('❌ Failed:', err.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

fixFeeds();
