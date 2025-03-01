import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db"; // Ensure Prisma is set up

export async function POST(req: Request) {
  try {
    const { role, name, email, password } = await req.json();

    // Validate inputs
    if (!role || !name || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Convert role to uppercase to match Prisma ENUM values
    const formattedRole = role.toUpperCase();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: { role: formattedRole, name, email, password: hashedPassword },
    });

    return NextResponse.json({ message: "User registered successfully!", user: newUser });
  } catch (error) {
    console.error("Signup error:", error);
    
    return NextResponse.json({ 
      message: "Internal server error", 
      error: String(error)  // Ensure response is always JSON
    }, { status: 500 });
  }
}
