import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total bikes count
    const totalBikes = await prisma.bike.count({
      where: {
        ownerId: session.user.id,
      },
    });

    // Get active rentals count
    const activeRentals = await prisma.rental.count({
      where: {
        bike: {
          ownerId: session.user.id,
        },
        status: 'ACTIVE',
      },
    });

    // Calculate total earnings
    const earnings = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        rental: {
          bike: {
            ownerId: session.user.id,
          },
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get total reviews count
    const totalReviews = await prisma.review.count({
      where: {
        bike: {
          ownerId: session.user.id,
        },
      },
    });

    // Get average rating
    const ratings = await prisma.review.aggregate({
      where: {
        bike: {
          ownerId: session.user.id,
        },
      },
      _avg: {
        rating: true,
      },
    });

    const stats = {
      totalBikes,
      activeRentals,
      totalEarnings: earnings._sum.amount || 0,
      totalReviews,
      averageRating: ratings._avg.rating || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
