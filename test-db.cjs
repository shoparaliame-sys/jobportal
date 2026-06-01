require('dotenv').config();
const { Pool } = require('pg');

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
console.log('Testing connection to:', url.replace(/:[^@]*@/, ':***@'));

const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW() as now, version();', (err, result) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Full error:', err);
  } else {
    console.log('✅ Connected successfully!');
    console.log('Current time:', result.rows[0].now);
    console.log('PostgreSQL version:', result.rows[0].version);
  }
  pool.end();
});
