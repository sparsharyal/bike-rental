import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // For password hashing
import pool from "@/lib/db"; // Import your MySQL connection pool

export async function POST(req: Request) {
  try {
    const { role, name, email, password } = await req.json();

    // Validate input fields
    if (!role || !name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check if the role is valid
    if (!["customer", "owner", "admin"].includes(role.toLowerCase())) {
      return NextResponse.json({ message: "Invalid role selected" }, { status: 400 });
    }

    // Check if the user already exists
    const [existingUsers] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user to the database
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role.toLowerCase()]
    );

    // Check if the user was created successfully
    if (result.affectedRows === 0) {
      throw new Error("Failed to create user");
    }

    return NextResponse.json(
      { 
        message: "Signup successful", 
        user: { id: result.insertId, email, role: role.toLowerCase() } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
