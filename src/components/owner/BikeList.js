'use client';

import Image from 'next/image';
import toast from 'react-hot-toast';

export default function BikeList({ bikes, onUpdate }) {
  async function handleToggleAvailability(bikeId, currentStatus) {
    try {
      const response = await fetch(`/api/owner/bikes/${bikeId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          available: !currentStatus
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bike availability');
      }

      toast.success('Bike availability updated');
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function handleDelete(bikeId) {
    if (!confirm('Are you sure you want to delete this bike?')) {
      return;
    }

    try {
      const response = await fetch(`/api/owner/bikes/${bikeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bike');
      }

      toast.success('Bike deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bikes.map((bike) => (
        <div key={bike.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-48">
            <Image
              src={bike.images?.[0] || '/images/default-bike.jpg'}
              alt={bike.model}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold">{bike.brand} {bike.model}</h3>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                bike.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {bike.available ? 'Available' : 'Not Available'}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{bike.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-gray-600">Type:</span> {bike.type}
              </div>
              <div>
                <span className="text-gray-600">Year:</span> {bike.year}
              </div>
              <div>
                <span className="text-gray-600">CC:</span> {bike.cc}
              </div>
              <div>
                <span className="text-gray-600">Location:</span> {bike.location}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600">Hourly Rate</div>
                <div className="text-lg font-semibold text-green-600">
                  Rs. {bike.hourly_rate}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Daily Rate</div>
                <div className="text-lg font-semibold text-green-600">
                  Rs. {bike.daily_rate}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => handleToggleAvailability(bike.id, bike.available)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                {bike.available ? 'Mark Unavailable' : 'Mark Available'}
              </button>
              <button
                onClick={() => handleDelete(bike.id)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {bikes.length === 0 && (
        <div className="col-span-full text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">No bikes listed yet</p>
        </div>
      )}
    </div>
  );
}
