\"use client";

import { useState, useEffect } from 'react';
import BikeTracker from '@/app/components/BikeTracker';
import { useSession } from 'next-auth/react';
import SuspiciousActivityMonitor from '@/app/components/SuspiciousActivityMonitor';
import MovementPatternAnalyzer from '@/app/components/MovementPatternAnalyzer';

interface RentalWithBike {
  id: string;
  bikeId: number;
  status: string;
  startLocation: string;
  endLocation: string;
  startTime: Date;
  endTime: Date;
  bike: {
    id: number;
    name: string;
  };
}

export default function FraudDetection() {
  const { data: session } = useSession();
  const [activeRentals, setActiveRentals] = useState<RentalWithBike[]>([]);
  const [selectedRental, setSelectedRental] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveRentals = async () => {
      try {
        const response = await fetch('/api/rentals?status=ACTIVE');
        const data = await response.json();
        setActiveRentals(data);
      } catch (error) {
        console.error('Failed to fetch active rentals:', error);
      }
    };

    fetchActiveRentals();
    const interval = setInterval(fetchActiveRentals, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Fraud Detection & Monitoring</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white rounded-lg shadow p-4 overflow-y-auto max-h-[600px]">
          <h2 className="text-lg font-semibold mb-4">Active Rentals</h2>
          <div className="space-y-2">
            {activeRentals.map((rental) => (
              <div
                key={rental.id}
                className={`p-3 rounded cursor-pointer ${selectedRental === rental.id ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                onClick={() => setSelectedRental(rental.id)}
              >
                <p className="font-medium">{rental.bike.name}</p>
                <p className="text-sm text-gray-600">
                  Start: {new Date(rental.startTime).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  From: {rental.startLocation}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Live Tracking</h2>
          {selectedRental ? (
            <BikeTracker
              bikeId={activeRentals.find(r => r.id === selectedRental)?.bikeId || 0}
              isActive={true}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Select a rental to view live tracking
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <SuspiciousActivityMonitor />
        </div>
        {selectedRental && (
          <div className="bg-white rounded-lg shadow p-4">
            <MovementPatternAnalyzer
              bikeId={activeRentals.find(r => r.id === selectedRental)?.bikeId || 0}
              onPatternDetected={(pattern) => {
                if (pattern.type === 'CIRCULAR' || pattern.type === 'ZIGZAG') {
                  console.log('Suspicious pattern detected:', pattern);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}