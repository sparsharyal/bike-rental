'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import RentalHistory from '@/components/customer/RentalHistory';
import AvailableBikes from '@/components/customer/AvailableBikes';
import SearchFilters from '@/components/customer/SearchFilters';

export default function CustomerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('available');
  const [bikes, setBikes] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    minPrice: '',
    maxPrice: ''
  });

  if (!session || session.user.role !== 'CUSTOMER') {
    router.push('/auth/signin');
    return null;
  }

  useEffect(() => {
    if (session?.user) {
      loadData();
    }
  }, [session, activeTab]);

  async function loadData() {
    try {
      if (activeTab === 'available') {
        const response = await fetch('/api/bikes/available');
        const data = await response.json();
        setBikes(data);
      } else {
        const response = await fetch('/api/rentals');
        const data = await response.json();
        setRentals(data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    }
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  const filteredBikes = bikes.filter(bike => {
    if (filters.location && !bike.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.type && bike.type !== filters.type) {
      return false;
    }
    if (filters.minPrice && bike.hourly_rate < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && bike.hourly_rate > filters.maxPrice) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}</h1>
        <div className="space-x-4">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'available'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Available Bikes
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Rental History
          </button>
        </div>
      </div>

      {activeTab === 'available' ? (
        <>
          <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
          <AvailableBikes bikes={filteredBikes} onRent={loadData} />
        </>
      ) : (
        <RentalHistory rentals={rentals} onStatusChange={loadData} />
      )}
    </div>
  );
}
