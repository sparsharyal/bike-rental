import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { approved } = await req.json();

    await db.execute(
      'UPDATE users SET is_approved = ? WHERE id = ? AND role = "OWNER"',
      [approved, id]
    );

    return NextResponse.json({
      message: `Owner ${approved ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error updating owner approval status:', error);
    return NextResponse.json(
      { error: 'Failed to update owner approval status' },
      { status: 500 }
    );
  }
}
