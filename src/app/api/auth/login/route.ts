import { NextResponse } from "next/server";
import bcrypt from "bcrypt"; // To compare hashed passwords
import { db } from "@/lib/db"; // Import your database connection

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Check if the email exists in the database
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password!" }, { status: 401 });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ message: "Invalid email or password!" }, { status: 401 });
    }

    // If valid, return the user role
    return NextResponse.json({ role: user.role }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "An error occurred while logging in!" }, { status: 500 });
  }
}
