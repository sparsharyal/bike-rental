'use server';

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const { userId } = await req.json();

    // Check if user exists and is an owner
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'OWNER') {
      return NextResponse.json(
        { error: 'User is not an owner' },
        { status: 400 }
      );
    }

    // Approve owner
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });

    // Create notification for owner
    await prisma.notification.create({
      data: {
        type: 'ACCOUNT_APPROVED',
        title: 'Account Approved',
        message: 'Your owner account has been approved by admin. You can now list your bikes.',
        userId: userId,
      },
    });

    return NextResponse.json({
      message: 'Owner approved successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error in approve-owner:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
