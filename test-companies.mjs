import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  // First, get all columns
  const columnsResult = await pool.query(`
    SELECT column_name, data_type FROM information_schema.columns 
    WHERE table_name = 'companies' ORDER BY ordinal_position
  `);
  console.log("Columns in companies table:");
  console.table(columnsResult.rows);

  // Then get some data
  const dataResult = await pool.query("SELECT * FROM companies LIMIT 1");
  console.log("\nSample data:");
  if (dataResult.rows.length > 0) {
    console.log("First company:", JSON.stringify(dataResult.rows[0], null, 2));
  }
} catch (e) {
  console.error("Error:", e.message);
  console.error(e.code, e.detail);
} finally {
  await pool.end();
}
