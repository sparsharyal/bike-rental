"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Bikes() {
  const { data: session } = useSession();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      const response = await fetch("/api/bikes");
      if (!response.ok) throw new Error("Failed to fetch bikes");
      const data = await response.json();
      setBikes(data);
    } catch (error) {
      toast.error("Error loading bikes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    // Implement filter logic here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="location"
            placeholder="Location"
            className="border p-2 rounded"
            value={filters.location}
            onChange={handleFilterChange}
          />
          <select
            name="type"
            className="border p-2 rounded"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="mountain">Mountain Bike</option>
            <option value="road">Road Bike</option>
            <option value="city">City Bike</option>
            <option value="electric">Electric Bike</option>
          </select>
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            className="border p-2 rounded"
            value={filters.minPrice}
            onChange={handleFilterChange}
          />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            className="border p-2 rounded"
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </div>
        <button
          onClick={applyFilters}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Apply Filters
        </button>
      </div>

      {/* Bikes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bikes.map((bike) => (
          <div
            key={bike.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {/* Add bike image here */}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{bike.model}</h3>
              <p className="text-gray-600 mb-2">{bike.type}</p>
              <p className="text-gray-800 font-bold mb-2">
                ${bike.hourlyRate}/hour
              </p>
              <p className="text-gray-600 mb-4">📍 {bike.location}</p>
              <Link
                href={`/bikes/${bike.id}`}
                className="block text-center bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {bikes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600">No bikes found</p>
        </div>
      )}
    </div>
  );
}
