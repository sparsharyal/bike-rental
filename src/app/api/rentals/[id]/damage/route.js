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
    const { description, images } = await request.json();

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

    // Create damage report
    const damage = await prisma.damage.create({
      data: {
        description,
        images: JSON.stringify(images), // Convert array to JSON string
        rental: {
          connect: {
            id: rental.id,
          },
        },
      },
    });

    // Create notification for bike owner
    await prisma.notification.create({
      data: {
        type: "DAMAGE_REPORTED",
        message: `New damage reported for your bike ${rental.bike.model}.`,
        user: {
          connect: {
            id: rental.bike.ownerId,
          },
        },
      },
    });

    // Create notification for admin
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
    });

    await Promise.all(
      admins.map((admin) =>
        prisma.notification.create({
          data: {
            type: "DAMAGE_REPORTED",
            message: `New damage reported for bike ${rental.bike.model}.`,
            user: {
              connect: {
                id: admin.id,
              },
            },
          },
        })
      )
    );

    return NextResponse.json(damage, { status: 201 });
  } catch (error) {
    console.error("Error reporting damage:", error);
    return NextResponse.json(
      { error: "Error reporting damage" },
      { status: 500 }
    );
  }
}
