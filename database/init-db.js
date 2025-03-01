const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
  });

  try {
    console.log('Connected to MySQL successfully!');

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS bike_rentals');
    console.log('Database bike_rentals created or already exists');

    // Use the database
    await connection.query('USE bike_rentals');
    console.log('Using bike_rentals database');

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .filter(statement => statement.trim())
      .map(statement => statement.trim() + ';');

    // Execute each statement
    for (const statement of statements) {
      await connection.query(statement);
    }
    
    console.log('Database schema executed successfully!');

    // Create admin user if it doesn't exist
    const adminPassword = '$2a$10$VG.V3qBLxYlECzqD5YEXpekK8S6BKcPxuXi0F.JE9.5oOPZsB3MCe'; // hashed password: admin123
    const adminId = '00000000-0000-0000-0000-000000000000';
    
    const [adminExists] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      ['admin@bikerental.com']
    );

    if (!adminExists.length) {
      await connection.query(
        'INSERT INTO users (id, name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?, ?)',
        [adminId, 'Admin', 'admin@bikerental.com', adminPassword, 'ADMIN', true]
      );
      console.log('Admin user created');
    }

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initializeDatabase();
