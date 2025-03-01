import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeRentals = await prisma.rental.findMany({
      where: {
        renterId: session.user.id,
        status: 'ACTIVE',
      },
      include: {
        bike: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            images: true,
          },
        },
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
        startDate: 'desc',
      },
    });

    return NextResponse.json({ rentals: activeRentals });
  } catch (error) {
    console.error('Error fetching active rentals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active rentals' },
      { status: 500 }
    );
  }
}
