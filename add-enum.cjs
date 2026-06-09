const { Pool } = require('pg');
require('dotenv').config();

async function addEnum() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(`ALTER TYPE source_type ADD VALUE 'scraping'`);
    console.log("Enum updated.");
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('Enum value already exists.');
    } else {
      console.error('Error:', err);
    }
  }
  process.exit(0);
}

addEnum();
