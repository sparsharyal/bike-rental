import { NextRequest, NextResponse } from 'next/server';
import { verifyPayment } from '@/app/utils/payments';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token, provider, rentalId } = await request.json();

    if (!token || !provider || !rentalId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const verificationResult = await verifyPayment(token, provider);

    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.message },
        { status: 400 }
      );
    }

    // Update rental payment status
    await prisma.rental.update({
      where: { id: rentalId },
      data: {
        paymentStatus: 'PAID',
        paymentProvider: provider.toUpperCase(),
        transactionId: verificationResult.transactionId,
        paidAmount: verificationResult.amount
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}