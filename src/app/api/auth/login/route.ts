import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"; // JWT for authentication
import pool from "@/lib/db"; // MySQL connection pool

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validation: Check if email and password are provided
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required!" }, { status: 400 });
    }

    // Fetch user from database
    const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Invalid email or password!" }, { status: 401 });
    }

    const user = rows[0];

    // Check if role is defined in the database (if missing or invalid, reject login)
    if (!user.role) {
      return NextResponse.json({ message: "User role is not assigned properly!" }, { status: 500 });
    }

    // Validate password with hashed password in DB
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Invalid email or password!" }, { status: 401 });
    }

    // ✅ Generate JWT Token including the role
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" } // Token valid for 7 days
    );

    // ✅ Decode the token to log the payload (helpful for debugging)
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("Decoded JWT:", decoded); // ✅ Ensure role and user data are correctly included

    // ✅ Return a response including the token, user data, and success message
    const response = NextResponse.json(
      { 
        message: "Login successful!", 
        user: { id: user.id, email: user.email, role: user.role }
      },
      { status: 200 }
    );

    // Set the token in the response cookies (HTTP-only, secure in production)
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure cookies are secure in production
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // Token valid for 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "An error occurred while logging in!" }, { status: 500 });
  }
}
