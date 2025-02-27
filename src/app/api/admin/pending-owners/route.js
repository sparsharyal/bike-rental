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

    const [rows] = await db.execute(`
      SELECT id, name, email, created_at
      FROM users
      WHERE role = 'OWNER'
      AND is_approved = false
      ORDER BY created_at DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching pending owners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending owners' },
      { status: 500 }
    );
  }
}
