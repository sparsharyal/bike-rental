import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');

    const where = {
      renterId: session.user.id,
      status: {
        not: 'ACTIVE',
      },
      ...(status && { status }),
    };

    // Get total count for pagination
    const total = await prisma.rental.count({ where });

    // Get rental history with pagination
    const rentals = await prisma.rental.findMany({
      where,
      include: {
        bike: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            images: true,
          },
        },
        review: true,
        damage: {
          select: {
            id: true,
            description: true,
            images: true,
            repairCost: true,
            status: true,
          },
        },
      },
      orderBy: {
        endDate: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      rentals,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching rental history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental history' },
      { status: 500 }
    );
  }
}
