"use client";

import React, { useState, useEffect } from "react";

const BikeList = () => {
  const [bikes, setBikes] = useState([]);
  const [filters, setFilters] = useState({ price: "", location: "", type: "" });

  useEffect(() => {
    const fetchBikes = async () => {
      const response = await fetch("/api/bikes"); // Replace with actual API call later
      const data = await response.json();
      setBikes(data);
    };
    fetchBikes();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredBikes = bikes.filter((bike) => {
    return (
      (filters.price ? bike.price <= filters.price : true) &&
      (filters.location ? bike.location.toLowerCase().includes(filters.location.toLowerCase()) : true) &&
      (filters.type ? bike.type.toLowerCase() === filters.type.toLowerCase() : true)
    );
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Available Bikes</h2>

      <div className="flex space-x-4 mb-4">
        <input
          type="number"
          name="price"
          placeholder="Max Price"
          value={filters.price}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={filters.location}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
        <select name="type" value={filters.type} onChange={handleFilterChange} className="p-2 border rounded">
          <option value="">All Types</option>
          <option value="dirt">Dirt Bike</option>
          <option value="sports">Sports Bike</option>
          <option value="naked">Naked Bike</option>
          <option value="cruiser">Cruiser Bike</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredBikes.length > 0 ? (
          filteredBikes.map((bike) => (
            <div key={bike.id} className="border rounded-lg p-4 shadow-md">
              <img src={bike.image} alt={bike.name} className="w-full h-40 object-cover rounded" />
              <h3 className="text-lg font-semibold mt-2">{bike.name}</h3>
              <p className="text-gray-600">{bike.description}</p>
              <p className="text-blue-500 font-semibold">Price: Rs. {bike.price}/day</p>
              <p className="text-gray-500">Location: {bike.location}</p>
              <button className="bg-green-500 text-white p-2 mt-2 rounded w-full">Rent Bike</button>
            </div>
          ))
        ) : (
          <p>No bikes available right now.</p>
        )}
      </div>
    </div>
  );
};

export default BikeList;
