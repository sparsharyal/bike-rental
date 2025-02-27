import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const bike = await prisma.bike.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!bike) {
      return NextResponse.json(
        { error: "Bike not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(bike);
  } catch (error) {
    console.error("Error fetching bike:", error);
    return NextResponse.json(
      { error: "Error fetching bike" },
      { status: 500 }
    );
  }
}
