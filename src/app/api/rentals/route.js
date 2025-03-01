import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// GET /api/rentals - Get all rentals for the current user
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
      SELECT r.*, b.model, b.brand, b.type, u.name as owner_name
      FROM rentals r
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

    query += ' ORDER BY r.created_at DESC';

    const [rows] = await db.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rentals' },
      { status: 500 }
    );
  }
}

// POST /api/rentals - Create a new rental
export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      bikeId,
      startDate,
      endDate,
      totalAmount,
      paymentMethod
    } = await req.json();

    // Start a transaction
    await db.beginTransaction();

    try {
      // Check if bike is available
      const [[bike]] = await db.execute(
        'SELECT * FROM bikes WHERE id = ? AND available = true FOR UPDATE',
        [bikeId]
      );

      if (!bike) {
        await db.rollback();
        return NextResponse.json(
          { error: 'Bike is not available' },
          { status: 400 }
        );
      }

      const rentalId = uuidv4();
      const paymentId = uuidv4();

      // Create rental record
      await db.execute(
        `INSERT INTO rentals (
          id, bike_id, renter_id, start_date, end_date,
          total_amount, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          rentalId,
          bikeId,
          session.user.id,
          startDate,
          endDate,
          totalAmount,
          'PENDING'
        ]
      );

      // Create payment record
      await db.execute(
        `INSERT INTO payments (
          id, rental_id, amount, method, status
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          paymentId,
          rentalId,
          totalAmount,
          paymentMethod,
          'PENDING'
        ]
      );

      // Update bike availability
      await db.execute(
        'UPDATE bikes SET available = false WHERE id = ?',
        [bikeId]
      );

      await db.commit();

      return NextResponse.json({
        message: 'Rental created successfully',
        rentalId,
        paymentId
      });
    } catch (error) {
      await db.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating rental:', error);
    return NextResponse.json(
      { error: 'Failed to create rental' },
      { status: 500 }
    );
  }
}
