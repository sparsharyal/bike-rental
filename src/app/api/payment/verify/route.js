import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { verifyKhaltiPayment } from '@/lib/payment/khalti';
import { verifyEsewaPayment } from '@/lib/payment/esewa';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethod, payload, rentalId } = await req.json();

    let verificationResult;

    // Verify payment based on the payment method
    if (paymentMethod === 'KHALTI') {
      verificationResult = await verifyKhaltiPayment(payload);
    } else if (paymentMethod === 'ESEWA') {
      verificationResult = await verifyEsewaPayment(payload);
    } else {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Update rental and payment status in database
    const updatedRental = await prisma.rental.update({
      where: { id: rentalId },
      data: {
        status: 'APPROVED',
        payment: {
          create: {
            amount: verificationResult.amount,
            status: 'COMPLETED',
            method: paymentMethod,
            transactionId: verificationResult.transactionId,
            paymentDetails: JSON.stringify(verificationResult)
          }
        }
      }
    });

    return NextResponse.json({ success: true, rental: updatedRental });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
