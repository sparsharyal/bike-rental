"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter

interface Bike {
  id: number;
  model: string;
  price: number;
  location: string;
  available: boolean;
  image: string;
}

export default function BikeList() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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
            <img src={bike.image} alt={bike.model} className="w-full h-40 object-cover rounded mb-2" />
            <h2 className="text-lg font-semibold">{bike.model}</h2>
            <p>{bike.location}</p>
            <p className="font-bold">${bike.price} / day</p>
          </div>
        ))}
      </div>
    </div>
  );
}
