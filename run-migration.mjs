import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  // Find the latest migration file
  const migrationsDir = './db/migrations';
  const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  const migrationFile = files[files.length - 1];
  
  if (!migrationFile) {
    console.error('❌ No migration files found!');
    process.exit(1);
  }
  
  const sql = readFileSync(join(migrationsDir, migrationFile), 'utf8');
  const statements = sql.split('--> statement-breakpoint').filter(s => s.trim());
  
  console.log(`\n🚀 Running migration: ${migrationFile}`);
  console.log(`📊 ${statements.length} SQL statements\n`);
  
  try {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt) {
        process.stdout.write(`[${i+1}/${statements.length}] `);
        await pool.query(stmt);
        console.log(`✅`);
      }
    }
    console.log('\n✅ Migration successful!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
