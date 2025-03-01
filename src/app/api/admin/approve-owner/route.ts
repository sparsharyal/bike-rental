import { NextResponse } from "next/server";
import { db } from "@/lib/db"; 

export async function POST(req: Request) {
  try {
    const { ownerId } = await req.json();

    const updatedUser = await db.user.update({
      where: { id: ownerId },
      data: { isApproved: true },
    });

    return NextResponse.json({ message: "Owner approved successfully!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error approving owner" }, { status: 500 });
  }
}
