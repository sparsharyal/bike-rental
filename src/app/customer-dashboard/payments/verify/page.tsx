"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

export default function PaymentVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Verifying payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const token = searchParams.get('token') || searchParams.get('oid') || '';
        const provider = searchParams.get('provider') || 'khalti';

        const response = await axios.post('/api/payments/verify', {
          token,
          provider
        });

        if (response.data.success) {
          setStatus('Payment successful! Redirecting...');
          setTimeout(() => {
            router.push('/customer-dashboard/rentals');
          }, 2000);
        } else {
          setStatus('Payment verification failed. Please try again.');
          setTimeout(() => {
            router.push('/customer-dashboard/payments');
          }, 3000);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('An error occurred during payment verification.');
        setTimeout(() => {
          router.push('/customer-dashboard/payments');
        }, 3000);
      }
    };

    verifyPayment();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification</h2>
          <p className="text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  );
}