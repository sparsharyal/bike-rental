'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { initiateKhaltiPayment } from '@/lib/payment/khalti';
import { initiateEsewaPayment } from '@/lib/payment/esewa';

export default function PaymentModal({ rental, onClose }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = async (method) => {
    try {
      setLoading(true);

      if (method === 'KHALTI') {
        const response = await initiateKhaltiPayment({
          amount: rental.totalAmount,
          productIdentity: rental.id,
          productName: rental.bike.model,
          customerInfo: {
            name: rental.renter.name,
            email: rental.renter.email,
          },
        });

        // Redirect to Khalti payment page
        window.location.href = response.payment_url;
      } else if (method === 'ESEWA') {
        initiateEsewaPayment({
          amount: rental.totalAmount,
          productId: rental.id,
          productName: rental.bike.model,
          successUrl: `${window.location.origin}/payment/success`,
          failureUrl: `${window.location.origin}/payment/failure`,
        });
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Choose Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">Rental Details</p>
            <p className="text-gray-600">{rental.bike.model}</p>
            <p className="text-lg font-bold text-green-600">
              Rs. {rental.totalAmount.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => handlePayment('KHALTI')}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 p-4 border rounded-lg hover:bg-purple-50 transition-colors"
          >
            <Image
              src="/images/khalti-logo.png"
              alt="Khalti"
              width={24}
              height={24}
            />
            <span className="font-medium text-purple-700">Pay with Khalti</span>
          </button>

          <button
            onClick={() => handlePayment('ESEWA')}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 p-4 border rounded-lg hover:bg-green-50 transition-colors"
          >
            <Image
              src="/images/esewa-logo.png"
              alt="eSewa"
              width={24}
              height={24}
            />
            <span className="font-medium text-green-700">Pay with eSewa</span>
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-center text-gray-600">
            <p>Processing payment...</p>
          </div>
        )}
      </div>
    </div>
  );
}
