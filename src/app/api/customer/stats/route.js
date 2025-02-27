import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total rentals count
    const totalRentals = await prisma.rental.count({
      where: {
        renterId: session.user.id,
      },
    });

    // Get active rentals count
    const activeRentals = await prisma.rental.count({
      where: {
        renterId: session.user.id,
        status: 'ACTIVE',
      },
    });

    // Calculate total spent
    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        rental: {
          renterId: session.user.id,
        },
      },
      select: {
        amount: true,
      },
    });

    const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get total reviews given
    const reviewsGiven = await prisma.review.count({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      totalRentals,
      activeRentals,
      totalSpent,
      reviewsGiven,
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer statistics' },
      { status: 500 }
    );
  }
}
