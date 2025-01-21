import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost", // Replace with your MySQL host
  user: "root", // Replace with your MySQL username
  password: "password", // Replace with your MySQL password
  database: "bike-app", 
});

export default pool;
