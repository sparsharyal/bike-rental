import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
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
    const { description, severity, images } = await req.json();

    // Start a transaction
    await db.beginTransaction();

    try {
      // Get the rental and check permissions
      const [[rental]] = await db.execute(
        `SELECT r.*, b.owner_id
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

      if (session.user.id !== rental.renter_id) {
        await db.rollback();
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Create issue record
      const issueId = uuidv4();
      await db.execute(
        `INSERT INTO issues (
          id, rental_id, description, severity,
          images, status
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          issueId,
          id,
          description,
          severity,
          JSON.stringify(images),
          'PENDING'
        ]
      );

      // Create notification for bike owner
      const notificationId = uuidv4();
      await db.execute(
        `INSERT INTO notifications (
          id, user_id, title, message
        ) VALUES (?, ?, ?, ?)`,
        [
          notificationId,
          rental.owner_id,
          'New Issue Reported',
          \`A new issue has been reported for rental #\${id}\`
        ]
      );

      await db.commit();

      return NextResponse.json({
        message: 'Issue reported successfully'
      });
    } catch (error) {
      await db.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error reporting issue:', error);
    return NextResponse.json(
      { error: 'Failed to report issue' },
      { status: 500 }
    );
  }
}
