"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Rental {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  bike: {
    name: string;
    imageUrl: string;
    price: number;
    location: string;
  };
  payment?: {
    amount: number;
    status: string;
    method: string;
  };
}

export default function RentalHistory() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/rentals');
        
        if (response.status === 401) {
          router.push('/auth/signin');
          throw new Error('Please login to view your rentals');
        } else if (response.status === 404) {
          throw new Error('Rental data not found');
        } else if (!response.ok) {
          throw new Error(`Failed to fetch rentals: ${response.statusText}`);
        }

        const data = await response.json();
        setRentals(data);
      } catch (error) {
        console.error('Error fetching rentals:', error);
        setError(error instanceof Error ? error.message : 'Failed to load rental history');
      } finally {
        setLoading(false);
      }
    };
    fetchRentals();
  }, [router]);

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Your Rental History</h1>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your rental history...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && rentals.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p>No rental history found.</p>
        </div>
      )}

      {!loading && !error && rentals.length > 0 && (
        <div className="space-y-4">
          {rentals.map((rental) => (
            <div key={rental.id} className="border rounded-lg p-4 shadow-md">
              <div className="flex items-start space-x-4">
                <img
                  src={rental.bike.imageUrl}
                  alt={rental.bike.name}
                  className="w-32 h-32 object-cover rounded"
                />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{rental.bike.name}</h2>
                  <p className="text-gray-600">{rental.bike.location}</p>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="font-medium">Start Date:</span>{' '}
                      {new Date(rental.startDate).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">End Date:</span>{' '}
                      {rental.endDate ? new Date(rental.endDate).toLocaleDateString() : 'Ongoing'}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span
                        className={`px-2 py-1 rounded text-sm ${rental.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : rental.status === 'ONGOING' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {rental.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Rs. {rental.bike.price}/day</p>
                  {rental.payment && (
                    <div className="mt-2 text-sm">
                      <p>
                        <span className="font-medium">Payment Status:</span>{' '}
                        <span
                          className={`px-2 py-1 rounded ${rental.payment.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : rental.payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {rental.payment.status}
                        </span>
                      </p>
                      <p className="mt-1">
                        <span className="font-medium">Method:</span> {rental.payment.method}
                      </p>
                      <p className="font-medium">Total: Rs. {rental.payment.amount}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}