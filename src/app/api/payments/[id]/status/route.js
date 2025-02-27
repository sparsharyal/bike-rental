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
      // Get the payment and check permissions
      const [[payment]] = await db.execute(
        `SELECT p.*, r.renter_id, b.owner_id
         FROM payments p
         JOIN rentals r ON p.rental_id = r.id
         JOIN bikes b ON r.bike_id = b.id
         WHERE p.id = ?
         FOR UPDATE`,
        [id]
      );

      if (!payment) {
        await db.rollback();
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }

      // Only the renter can update the payment status
      if (session.user.id !== payment.renter_id) {
        await db.rollback();
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Update payment status
      await db.execute(
        'UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );

      // If payment is successful, update rental status to CONFIRMED
      if (status === 'COMPLETED') {
        await db.execute(
          'UPDATE rentals SET status = "CONFIRMED", updated_at = NOW() WHERE id = ?',
          [payment.rental_id]
        );
      }

      await db.commit();
      return NextResponse.json({
        message: 'Payment status updated successfully'
      });
    } catch (error) {
      await db.rollback();
      console.error('Error updating payment status:', error);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in payment status update:', error);
    return NextResponse.json(
      { error: 'Failed to process payment status update' },
      { status: 500 }
    );
  }
}
