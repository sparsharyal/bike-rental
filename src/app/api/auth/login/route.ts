import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db"; // Ensure correct Prisma client import
import { Role } from "@prisma/client"; // Import Prisma Role enum

export async function POST(req: Request) {
  try {
    // Parse JSON request body safely
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ message: "Invalid JSON format" }, { status: 400 });

    const { email, password, role } = body;

    // Validate input fields
    if (!email || !password || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Normalize role to uppercase
    const userRole = role.toUpperCase() as Role;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password for user:", email);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Ensure role matches the stored role
    if (user.role !== userRole) {
      console.log(`Role mismatch: Expected ${user.role}, got ${userRole}`);
      return NextResponse.json({ message: "Role mismatch" }, { status: 403 });
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("Error: JWT_SECRET is not set in .env file.");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    return NextResponse.json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (error: any) {
    console.error("Login error:", error.message);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
