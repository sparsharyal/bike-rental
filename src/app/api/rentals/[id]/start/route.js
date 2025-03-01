import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
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
        bike: true,
      },
    });

    if (!rental) {
      return NextResponse.json(
        { error: "Rental not found" },
        { status: 404 }
      );
    }

    if (rental.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (rental.status !== "PENDING") {
      return NextResponse.json(
        { error: "Rental cannot be started" },
        { status: 400 }
      );
    }

    // Update rental status
    const updatedRental = await prisma.rental.update({
      where: { id },
      data: {
        status: "ACTIVE",
        startTime: new Date(),
      },
    });

    // Create initial GPS log
    await prisma.gpsLog.create({
      data: {
        latitude: rental.bike.latitude,
        longitude: rental.bike.longitude,
        rental: {
          connect: {
            id: rental.id,
          },
        },
      },
    });

    return NextResponse.json(updatedRental);
  } catch (error) {
    console.error("Error starting rental:", error);
    return NextResponse.json(
      { error: "Error starting rental" },
      { status: 500 }
    );
  }
}
