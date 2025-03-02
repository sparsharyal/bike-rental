import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const location = formData.get("location") as string;
    const image = formData.get("image") as File;

    if (!name || !description || !price || !location || !image) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Save image to public folder
    const imagePath = `/uploads/${Date.now()}-${image.name}`;
    const imageBuffer = await image.arrayBuffer();
    await writeFile(path.join("public", imagePath), Buffer.from(imageBuffer));

    // Insert bike details into database using Prisma
    const bike = await prisma.bike.create({
      data: {
        name,
        description,
        price: parseFloat(price), // Assuming price is stored as a float in the database
        location,
        image: imagePath,
      },
    });

    return NextResponse.json({ message: "Bike listed successfully!", bikeId: bike.id });
  } catch (error) {
    console.error("Error listing bike:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}