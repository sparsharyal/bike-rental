import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT bikes.*, users.name as owner_name 
      FROM bikes 
      JOIN users ON bikes.owner_id = users.id
      WHERE bikes.available = true
      AND users.is_approved = true
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching available bikes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available bikes' },
      { status: 500 }
    );
  }
}
