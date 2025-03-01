import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: Request) {
  const token = req.cookies.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));

    const role = payload.role;

    if (req.nextUrl.pathname.startsWith("/admin-dashboard") && role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/owner-dashboard") && role !== "owner") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (req.nextUrl.pathname.startsWith("/customer-dashboard") && role !== "customer") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/admin-dashboard", "/owner-dashboard", "/customer-dashboard"],
};
