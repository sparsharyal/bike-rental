import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost", 
  user: "root", 
  password: "", 
  database: "bike-app", 
});

export default pool;
