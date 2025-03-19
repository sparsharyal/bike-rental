"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

interface Bike {
  id: number;
  name: string;
  description: string;
  price: number;
  location: string;
  available: boolean;
  imageUrl: string;
}

interface RentalModal {
  isOpen: boolean;
  bike: Bike | null;
}

export default function BikeList() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [modal, setModal] = useState<RentalModal>({ isOpen: false, bike: null });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const router = useRouter(); // Initialize router

  useEffect(() => {
    fetch(`/api/bikes?model=${search}&location=${location}&minPrice=${minPrice}&maxPrice=${maxPrice}`)
      .then((res) => res.json())
      .then((data) => setBikes(data));
  }, [search, location, minPrice, maxPrice]);

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()} 
        className="mb-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        ← Back
      </button>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search model..."
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location..."
          className="border p-2 rounded"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Price"
          className="border p-2 rounded"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          className="border p-2 rounded"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bikes.map((bike) => (
          <div key={bike.id} className="border p-4 rounded shadow-md">
            <img src={bike.imageUrl} alt={bike.name} className="w-full h-40 object-cover rounded mb-2" />
            <h2 className="text-lg font-semibold">{bike.name}</h2>
            <p className="text-gray-600">{bike.description}</p>
            <p>{bike.location}</p>
            <p className="font-bold">Rs. {bike.price} / day</p>
            <button
              onClick={() => setModal({ isOpen: true, bike })}
              className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Rent Now
            </button>
          </div>
        ))}
      </div>

      {/* Rental Modal */}
      {modal.isOpen && modal.bike && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Rent {modal.bike.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 block w-full border rounded-md shadow-sm p-2"
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="text-lg font-semibold">
                Total Price: Rs. {startDate && endDate
                  ? modal.bike.price * Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
                  : 0
                }
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={async () => {
                    if (!startDate || !endDate) {
                      alert('Please select both start and end dates');
                      return;
                    }
                    try {
                      const response = await fetch('/api/rentals', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          bikeId: modal.bike.id,
                          startDate,
                          endDate
                        })
                      });
                      if (!response.ok) throw new Error('Failed to create rental');
                      alert('Rental created successfully!');
                      setModal({ isOpen: false, bike: null });
                      setStartDate('');
                      setEndDate('');
                    } catch (error) {
                      alert('Failed to create rental. Please try again.');
                    }
                  }}
                  className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  Confirm Rental
                </button>
                <button
                  onClick={() => {
                    setModal({ isOpen: false, bike: null });
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
