'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import BikeList from '@/components/owner/BikeList';
import RentalRequests from '@/components/owner/RentalRequests';
import AddBikeForm from '@/components/owner/AddBikeForm';
import Statistics from '@/components/owner/Statistics';

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('bikes');
  const [bikes, setBikes] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [stats, setStats] = useState(null);
  const [showAddBike, setShowAddBike] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadData();
    }
  }, [session, activeTab]);

  async function loadData() {
    try {
      if (activeTab === 'bikes') {
        const response = await fetch('/api/owner/bikes');
        const data = await response.json();
        setBikes(data);
      } else if (activeTab === 'rentals') {
        const response = await fetch('/api/rentals');
        const data = await response.json();
        setRentals(data);
      }

      // Load statistics
      const statsResponse = await fetch('/api/owner/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load data');
    }
  }

  if (!session?.user?.isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Account Pending Approval
          </h1>
          <p className="text-gray-600">
            Your account is currently pending approval from our administrators.
            You will be notified once your account is approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        {activeTab === 'bikes' && (
          <button
            onClick={() => setShowAddBike(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Add New Bike
          </button>
        )}
      </div>

      {stats && <Statistics stats={stats} />}

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('bikes')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'bikes'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          My Bikes
        </button>
        <button
          onClick={() => setActiveTab('rentals')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'rentals'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Rental Requests
        </button>
      </div>

      {activeTab === 'bikes' ? (
        <BikeList bikes={bikes} onUpdate={loadData} />
      ) : (
        <RentalRequests rentals={rentals} onUpdate={loadData} />
      )}

      {showAddBike && (
        <AddBikeForm
          onClose={() => setShowAddBike(false)}
          onSuccess={() => {
            setShowAddBike(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
