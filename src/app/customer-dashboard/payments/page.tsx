"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { initiateKhaltiPayment, initiateEsewaPayment } from '@/app/utils/payments';

interface PaymentProps {
  rentalId: string;
  amount: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (provider: 'khalti' | 'esewa', rentalId: string, amount: number) => {
    setLoading(true);
    setError('');
    try {
      const response = provider === 'khalti' 
        ? await initiateKhaltiPayment(amount, rentalId)
        : await initiateEsewaPayment(amount, rentalId);

      if (response.transactionId) {
        window.location.href = response.transactionId;
      } else {
        setError('Payment initiation failed');
      }
    } catch (err) {
      setError('Failed to process payment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Payment Methods</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => handlePayment('khalti', '123', 1000)}
          disabled={loading}
          className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <img src="/images/khalti-logo.png" alt="Khalti" className="h-12 mb-4" />
          <h2 className="text-lg font-semibold">Pay with Khalti</h2>
          <p className="text-gray-600">Fast and secure payment with Khalti digital wallet</p>
        </button>

        <button
          onClick={() => handlePayment('esewa', '123', 1000)}
          disabled={loading}
          className="p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <img src="/images/esewa-logo.png" alt="eSewa" className="h-12 mb-4" />
          <h2 className="text-lg font-semibold">Pay with eSewa</h2>
          <p className="text-gray-600">Quick and reliable payment with eSewa</p>
        </button>
      </div>
    </div>
  );
}