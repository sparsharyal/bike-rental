import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/rentals/[id] - Get rental details
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    const rental = await prisma.rental.findUnique({
      where: { id },
      include: {
        bike: {
          include: {
            owner: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        payment: true,
        gpsLogs: {
          orderBy: {
            timestamp: "desc",
          },
          take: 1,
        },
        damages: true,
      },
    });

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      );
    }

    // Check if user is authorized to view this rental
    if (
      rental.userId !== session.user.id &&
      rental.bike.ownerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(rental);
  } catch (error) {
    console.error("Error fetching rental:", error);
    return NextResponse.json(
      { error: "Error fetching rental" },
      { status: 500 }
    );
  }
}
