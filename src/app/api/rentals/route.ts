import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bikeId, startDate, endDate } = await req.json();

    // Validate required fields
    if (!bikeId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if bike exists and is available
    const bike = await prisma.bike.findUnique({
      where: { id: bikeId },
    });

    if (!bike) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }

    if (!bike.available) {
      return NextResponse.json({ error: 'Bike is not available' }, { status: 400 });
    }

    // Create rental record
    const rental = await prisma.rental.create({
      data: {
        customerId: session.user.id,
        bikeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'ONGOING',
      },
    });

    // Update bike availability
    await prisma.bike.update({
      where: { id: bikeId },
      data: { available: false },
    });

    return NextResponse.json(rental, { status: 201 });
  } catch (error) {
    console.error('Error creating rental:', error);
    return NextResponse.json({ error: 'Failed to create rental' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rentals = await prisma.rental.findMany({
      where: { customerId: session.user.id },
      include: {
        bike: true,
        payment: true,
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(rentals, { status: 200 });
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json({ error: 'Failed to fetch rentals' }, { status: 500 });
  }
}