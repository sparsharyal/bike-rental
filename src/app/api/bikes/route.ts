import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db"; 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const model = searchParams.get("model") || undefined;
    const location = searchParams.get("location") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;

    const bikes = await prisma.bike.findMany({
      where: {
        available: true,
        model: model ? { contains: model, mode: "insensitive" } : undefined,
        location: location ? { contains: location, mode: "insensitive" } : undefined,
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
    });

    return NextResponse.json(bikes, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bikes" }, { status: 500 });
  }
}
