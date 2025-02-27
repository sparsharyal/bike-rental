import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const bikes = await prisma.bike.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate average rating for each bike
    const bikesWithRating = bikes.map((bike) => {
      const ratings = bike.reviews.map((review) => review.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b) / ratings.length
          : null;

      const { reviews, ...bikeWithoutReviews } = bike;
      return {
        ...bikeWithoutReviews,
        averageRating,
        reviewCount: ratings.length,
      };
    });

    return NextResponse.json(bikesWithRating);
  } catch (error) {
    console.error("Error fetching owner's bikes:", error);
    return NextResponse.json(
      { error: "Error fetching bikes" },
      { status: 500 }
    );
  }
}
