import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating' },
        { status: 400 }
      );
    }

    // Get rental details
    const rental = await prisma.rental.findUnique({
      where: { id: params.id },
      include: {
        bike: true,
        review: true,
      },
    });

    if (!rental) {
      return NextResponse.json(
        { error: 'Rental not found' },
        { status: 404 }
      );
    }

    if (rental.renterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to review this rental' },
        { status: 403 }
      );
    }

    if (rental.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot review an incomplete rental' },
        { status: 400 }
      );
    }

    if (rental.review) {
      return NextResponse.json(
        { error: 'Review already exists' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: session.user.id,
        bikeId: rental.bike.id,
        rentalId: rental.id,
      },
    });

    // Update bike average rating
    const bikeReviews = await prisma.review.findMany({
      where: {
        bikeId: rental.bike.id,
      },
      select: {
        rating: true,
      },
    });

    const averageRating =
      bikeReviews.reduce((acc, curr) => acc + curr.rating, 0) /
      bikeReviews.length;

    await prisma.bike.update({
      where: { id: rental.bike.id },
      data: {
        rating: averageRating,
      },
    });

    // Create notification for bike owner
    await prisma.notification.create({
      data: {
        type: 'NEW_REVIEW',
        title: 'New Review Received',
        message: `Your bike ${rental.bike.model} received a ${rating}-star review`,
        userId: rental.bike.ownerId,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
