import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import db from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { status } = await req.json();

    // Start a transaction
    await db.beginTransaction();

    try {
      // Get the rental and check permissions
      const [[rental]] = await db.execute(
        `SELECT r.*, b.owner_id, b.id as bike_id
         FROM rentals r
         JOIN bikes b ON r.bike_id = b.id
         WHERE r.id = ?
         FOR UPDATE`,
        [id]
      );

      if (!rental) {
        await db.rollback();
        return NextResponse.json(
          { error: 'Rental not found' },
          { status: 404 }
        );
      }

      // Only the bike owner can update the status
      if (session.user.id !== rental.owner_id) {
        await db.rollback();
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Update rental status
      await db.execute(
        'UPDATE rentals SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );

      // If rental is completed, make bike available again
      if (status === 'COMPLETED') {
        await db.execute(
          'UPDATE bikes SET is_available = true, updated_at = NOW() WHERE id = ?',
          [rental.bike_id]
        );
      }

      // If rental is cancelled, make bike available and refund if needed
      if (status === 'CANCELLED') {
        await db.execute(
          'UPDATE bikes SET is_available = true, updated_at = NOW() WHERE id = ?',
          [rental.bike_id]
        );

        // Check if payment exists and refund needed
        const [[payment]] = await db.execute(
          'SELECT * FROM payments WHERE rental_id = ? AND status = "COMPLETED"',
          [id]
        );

        if (payment) {
          await db.execute(
            'INSERT INTO refunds (payment_id, amount, status, reason) VALUES (?, ?, "PENDING", "Rental cancelled")',
            [payment.id, payment.amount]
          );
        }
      }

      await db.commit();
      return NextResponse.json({
        message: 'Rental status updated successfully'
      });
    } catch (error) {
      await db.rollback();
      console.error('Error updating rental status:', error);
      return NextResponse.json(
        { error: 'Failed to update rental status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in rental status update:', error);
    return NextResponse.json(
      { error: 'Failed to process rental status update' },
      { status: 500 }
    );
  }
}
