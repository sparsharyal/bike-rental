import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rentalId, rating, comment } = await request.json();

    if (!rentalId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid review data' },
        { status: 400 }
      );
    }

    // Verify that the rental belongs to the user
    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { bike: true }
    });

    if (!rental || rental.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Rental not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        rental: { connect: { id: rentalId } },
        bike: { connect: { id: rental.bikeId } },
        user: { connect: { id: session.user.id } }
      }
    });

    // Update bike's average rating
    const bikeReviews = await prisma.review.findMany({
      where: { bikeId: rental.bikeId }
    });

    const averageRating = bikeReviews.reduce((acc, review) => acc + review.rating, 0) / bikeReviews.length;

    await prisma.bike.update({
      where: { id: rental.bikeId },
      data: { averageRating }
    });

    return NextResponse.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bikeId = searchParams.get('bikeId');

    if (!bikeId) {
      return NextResponse.json(
        { error: 'Bike ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { bikeId },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Review fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}