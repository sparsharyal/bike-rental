import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ message: "Invalid JSON format" }, { status: 400 });

    const { email, password, role } = body;
    if (!email || !password || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const userRole = role.toUpperCase() as Role;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password)) || user.role !== userRole) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ message: "Server error: Missing JWT_SECRET" }, { status: 500 });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Create response and set HTTP-only cookie
    const response = NextResponse.json({ message: "Login successful", role: user.role });
    response.headers.set("Set-Cookie", `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=7200`);

    return response;
  } catch (error: any) {
    console.error("Login error:", error.message);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
