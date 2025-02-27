import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db from '@/lib/db';

// GET /api/payments - Get all payments for the current user
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let query = `
      SELECT p.*, r.start_date, r.end_date,
      b.model, b.brand, b.type,
      u.name as owner_name
      FROM payments p
      JOIN rentals r ON p.rental_id = r.id
      JOIN bikes b ON r.bike_id = b.id
      JOIN users u ON b.owner_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (session.user.role === 'CUSTOMER') {
      query += ' AND r.renter_id = ?';
      params.push(session.user.id);
    } else if (session.user.role === 'OWNER') {
      query += ' AND b.owner_id = ?';
      params.push(session.user.id);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await db.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
