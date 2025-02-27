import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Function to generate random coordinates within a radius of the initial position
function generateRandomCoordinates(initialLat, initialLng, radiusKm = 0.5) {
  // Earth's radius in kilometers
  const R = 6371;

  // Convert radius from kilometers to radians
  const radiusInRadian = radiusKm / R;

  // Generate random angle
  const randomAngle = Math.random() * 2 * Math.PI;

  // Generate random radius within the specified radius
  const randomRadius = Math.random() * radiusInRadian;

  // Calculate new coordinates
  const lat = Math.asin(
    Math.sin(initialLat * (Math.PI / 180)) * Math.cos(randomRadius) +
    Math.cos(initialLat * (Math.PI / 180)) * Math.sin(randomRadius) * Math.cos(randomAngle)
  );

  const lng =
    initialLng * (Math.PI / 180) +
    Math.atan2(
      Math.sin(randomAngle) * Math.sin(randomRadius) * Math.cos(initialLat * (Math.PI / 180)),
      Math.cos(randomRadius) - Math.sin(initialLat * (Math.PI / 180)) * Math.sin(lat)
    );

  return {
    latitude: lat * (180 / Math.PI),
    longitude: lng * (180 / Math.PI),
  };
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { rentalId } = params;

    // Get rental and bike details
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
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

    // Check authorization
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

    // Generate random coordinates near the bike's initial location
    const newCoordinates = generateRandomCoordinates(
      rental.bike.latitude,
      rental.bike.longitude
    );

    // Save the GPS log
    const gpsLog = await prisma.gpsLog.create({
      data: {
        latitude: newCoordinates.latitude,
        longitude: newCoordinates.longitude,
        rental: {
          connect: {
            id: rentalId,
          },
        },
      },
    });

    return NextResponse.json(gpsLog);
  } catch (error) {
    console.error("Error fetching GPS data:", error);
    return NextResponse.json(
      { error: "Error fetching GPS data" },
      { status: 500 }
    );
  }
}
