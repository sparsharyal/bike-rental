import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: Request) {
  const cookies = req.headers.get("cookie");
  const token = cookies?.split("; ").find((c) => c.startsWith("token="))?.split("=")[1];

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!));
    const role = payload.role.toUpperCase(); // Ensure consistency

    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin-dashboard") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/owner-dashboard") && role !== "OWNER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/customer-dashboard") && role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: ["/admin-dashboard", "/owner-dashboard", "/customer-dashboard"],
};
