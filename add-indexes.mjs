import 'dotenv/config';
import { Pool } from 'pg';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

const indexes = [
  'CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" USING btree ("slug");',
  'CREATE UNIQUE INDEX "companies_slug_unique" ON "companies" USING btree ("slug");',
  'CREATE UNIQUE INDEX "feeds_url_unique" ON "feeds" USING btree ("url");',
];

async function addIndexes() {
  console.log('\n🔧 Adding missing unique indexes...\n');
  
  try {
    for (const idx of indexes) {
      console.log('Creating index...');
      await pool.query(idx);
      console.log('✅ Done\n');
    }
    console.log('✅ All indexes created!');
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addIndexes();
