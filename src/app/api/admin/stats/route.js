import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all stats in parallel
    const [
      [userStats],
      [bikeStats],
      [rentalStats],
      [pendingOwnerStats]
    ] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM users'),
      db.execute('SELECT COUNT(*) as count FROM bikes'),
      db.execute('SELECT COUNT(*) as count FROM rentals'),
      db.execute('SELECT COUNT(*) as count FROM users WHERE role = "OWNER" AND is_approved = false')
    ]);

    return NextResponse.json({
      totalUsers: userStats.count,
      totalBikes: bikeStats.count,
      totalRentals: rentalStats.count,
      pendingOwners: pendingOwnerStats.count
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
