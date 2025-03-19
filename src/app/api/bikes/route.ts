import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const model = searchParams.get("model") || undefined;
    const location = searchParams.get("location") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;

    const bikes = await prisma.bike.findMany({
      where: {
        available: true,
        model: model ? { contains: model, mode: "insensitive" } : undefined,
        location: location ? { contains: location, mode: "insensitive" } : undefined,
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
    });

    return NextResponse.json(bikes, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bikes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const location = formData.get('location') as string;
    const image = formData.get('image') as File;

    if (!name || !description || !price || !location || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save the image
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imagePath = join('public', 'uploads', image.name);
    await writeFile(imagePath, buffer);

    // Create bike listing in database
    const bike = await prisma.bike.create({
      data: {
        name,
        description,
        price,
        location,
        imageUrl: `/uploads/${image.name}`,
        available: true,
      },
    });

    return NextResponse.json(bike, { status: 201 });
  } catch (error) {
    console.error('Error creating bike listing:', error);
    return NextResponse.json({ error: 'Failed to create bike listing' }, { status: 500 });
  }
}
