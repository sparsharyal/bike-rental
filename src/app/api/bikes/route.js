import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
import db from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/bikes - Get all bikes
export async function GET() {
  try {
    const [rows] = await db.execute(
      'SELECT bikes.*, users.name as owner_name FROM bikes JOIN users ON bikes.owner_id = users.id'
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching bikes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bikes' },
      { status: 500 }
    );
  }
}

// POST /api/bikes - Create a new bike
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['OWNER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      model,
      type,
      brand,
      year,
      cc,
      description,
      hourly_rate,
      daily_rate,
      location,
      latitude,
      longitude,
      images,
      features,
      documents
    } = await req.json();

    const bikeId = uuidv4();
    const ownerId = session.user.id;

    await db.execute(
      `INSERT INTO bikes (
        id, model, type, brand, year, cc, description,
        hourly_rate, daily_rate, location, latitude, longitude,
        images, features, documents, owner_id, available
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
      [
        bikeId,
        model,
        type,
        brand,
        year,
        cc,
        description,
        hourly_rate,
        daily_rate,
        location,
        latitude,
        longitude,
        JSON.stringify(images || []),
        JSON.stringify(features || []),
        JSON.stringify(documents || []),
        ownerId
      ]
    );

    return NextResponse.json(
      { message: 'Bike created successfully', id: bikeId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating bike:', error);
    return NextResponse.json(
      { error: 'Failed to create bike' },
      { status: 500 }
    );
  }
}

// PUT /api/bikes/:id - Update bike details
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    // Check if user owns the bike or is admin
    const [[bike]] = await db.execute(
      'SELECT * FROM bikes WHERE id = ?',
      [id]
    );

    if (!bike) {
      return NextResponse.json(
        { error: 'Bike not found' },
        { status: 404 }
      );
    }

    if (bike.owner_id !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = [];
    const values = [];
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length > 0) {
      const query = `UPDATE bikes SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      values.push(id);
      await db.execute(query, values);
    }

    const [[updatedBike]] = await db.execute('SELECT * FROM bikes WHERE id = ?', [id]);
    return NextResponse.json(updatedBike);
  } catch (error) {
    console.error('Error updating bike:', error);
    return NextResponse.json(
      { error: 'Failed to update bike' },
      { status: 500 }
    );
  }
}