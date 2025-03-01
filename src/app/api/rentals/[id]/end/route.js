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

    if (rental.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Rental cannot be ended" },
        { status: 400 }
      );
    }

    // Calculate final amount based on actual duration
    const startTime = new Date(rental.startTime);
    const endTime = new Date();
    const durationInHours = (endTime - startTime) / (1000 * 60 * 60);
    const finalAmount = rental.bike.hourlyRate * durationInHours;

    // Update rental status and bike availability
    const [updatedRental] = await prisma.$transaction([
      prisma.rental.update({
        where: { id },
        data: {
          status: "COMPLETED",
          endTime,
          totalAmount: finalAmount,
        },
      }),
      prisma.bike.update({
        where: { id: rental.bikeId },
        data: { available: true },
      }),
    ]);

    // Create notification for bike owner
    await prisma.notification.create({
      data: {
        type: "RENTAL_COMPLETED",
        message: `Rental for your bike ${rental.bike.model} has been completed.`,
        user: {
          connect: {
            id: rental.bike.ownerId,
          },
        },
      },
    });

    return NextResponse.json(updatedRental);
  } catch (error) {
    console.error("Error ending rental:", error);
    return NextResponse.json(
      { error: "Error ending rental" },
      { status: 500 }
    );
  }
}
