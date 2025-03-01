import pool from "./db";


async function testDB() {
  try {
    const [rows] = await pool.query("SELECT 1+1 AS result");
    console.log("✅ DB Connection Success:", rows);
  } catch (error) {
    console.error("❌ DB Connection Error:", error);
  }
}

testDB();
