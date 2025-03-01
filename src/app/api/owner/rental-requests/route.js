import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * @param {Request} request
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    // Get rental requests for owner's bikes
    const where = {
      bike: {
        ownerId: session.user.id,
      },
      status: 'PENDING',
    };

    // Get total count for pagination
    const total = await prisma.rental.count({ where });

    // Get rental requests with pagination
    const rentalRequests = await prisma.rental.findMany({
      where,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        totalAmount: true,
        bike: {
          select: {
            id: true,
            model: true,
            brand: true,
            images: true,
          },
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            rentals: {
              select: {
                id: true,
                status: true,
                review: {
                  select: {
                    rating: true,
                  },
                },
              },
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate renter statistics
    const requestsWithStats = rentalRequests.map((request) => {
      const completedRentals = request.renter.rentals.length;
      const averageRating =
        request.renter.rentals.reduce((acc, rental) => {
          return rental.review ? acc + rental.review.rating : acc;
        }, 0) / completedRentals || 0;

      return {
        ...request,
        renter: {
          ...request.renter,
          stats: {
            completedRentals,
            averageRating,
          },
        },
      };
    });

    return NextResponse.json({
      rentalRequests: requestsWithStats,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching rental requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental requests' },
      { status: 500 }
    );
  }
}

/**
 * @param {Request} request
 */
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rentalId, action } = body;

    if (!rentalId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the rental belongs to one of the owner's bikes
    const rental = await prisma.rental.findFirst({
      where: {
        id: rentalId,
        bike: {
          ownerId: session.user.id,
        },
      },
      include: {
        bike: true,
        renter: true,
      },
    });

    if (!rental) {
      return NextResponse.json(
        { error: 'Rental request not found' },
        { status: 404 }
      );
    }

    if (rental.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Rental is not in pending state' },
        { status: 400 }
      );
    }

    // Update rental status
    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const updatedRental = await prisma.rental.update({
      where: { id: rentalId },
      data: { status },
      include: {
        bike: true,
        renter: true,
      },
    });

    // Create notification for the renter
    await prisma.notification.create({
      data: {
        type: status === 'APPROVED' ? 'RENTAL_APPROVED' : 'RENTAL_REJECTED',
        title: `Rental ${status.toLowerCase()}`,
        message: `Your rental request for ${rental.bike.model} has been ${status.toLowerCase()}`,
        userId: rental.renter.id,
      },
    });

    return NextResponse.json(updatedRental);
  } catch (error) {
    console.error('Error updating rental request:', error);
    return NextResponse.json(
      { error: 'Failed to update rental request' },
      { status: 500 }
    );
  }
}
