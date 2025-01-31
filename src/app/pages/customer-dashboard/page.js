"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [bikes, setBikes] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    price: "",
    type: "",
  });
  const [searchQuery, setSearchQuery] = useState(""); // For searching bike models

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "customer") {
      router.push("/auth/login");
    } else {
      // Fetch user data
      fetchUserData(token);
      // Fetch bikes for the marketplace
      fetchBikes();
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const res = await fetch("/api/user/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUserData(data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchBikes = async () => {
    try {
      const res = await fetch("/api/bikes", {
        method: "GET",
      });

      const data = await res.json();
      setBikes(data.bikes);
    } catch (error) {
      console.error("Error fetching bikes:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/auth/login");
  };

  // Filtered bikes based on location, price, type, and search query
  const filteredBikes = bikes.filter((bike) => {
    const matchLocation = filters.location ? bike.location.toLowerCase().includes(filters.location.toLowerCase()) : true;
    const matchPrice = filters.price ? bike.price <= parseFloat(filters.price) : true;
    const matchType = filters.type ? bike.type.toLowerCase() === filters.type.toLowerCase() : true;
    const matchSearch = bike.model.toLowerCase().includes(searchQuery.toLowerCase());

    return matchLocation && matchPrice && matchType && matchSearch;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container mx-auto px-6 py-8 relative">
      {/* Logout button positioned at the top-right */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
      >
        Logout
      </button>

      <h1 className="text-4xl font-semibold text-center text-blue-600 mb-8">Welcome to Your Dashboard</h1>

      {userData && (
        <div className="bg-white shadow-lg p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-medium mb-4">User Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p><strong>Name:</strong> {userData.name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Role:</strong> {userData.role}</p>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg p-6 rounded-lg">
        <h2 className="text-2xl font-medium mb-6">Explore Marketplace</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2">Location:</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Search by location"
              className="p-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Max Price:</label>
            <input
              type="number"
              name="price"
              value={filters.price}
              onChange={handleFilterChange}
              placeholder="Max Price"
              className="p-2 w-full border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Bike Type:</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="p-2 w-full border border-gray-300 rounded-lg"
            >
              <option value="">Select Type</option>
              <option value="mountain">Mountain</option>
              <option value="road">Road</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search bikes by model"
            className="p-2 w-full border border-gray-300 rounded-lg"
          />
        </div>

        {/* Display filtered bikes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBikes.length > 0 ? (
            filteredBikes.map((bike) => (
              <div key={bike.id} className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-4">
                <h3 className="text-xl font-semibold mb-2">{bike.model}</h3>
                <p className="text-gray-600 mb-4">{bike.description}</p>
                <p><strong>Price:</strong> {bike.price}</p>
                <p><strong>Location:</strong> {bike.location}</p>
                <p><strong>Rating:</strong> {bike.rating}</p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-4 w-full hover:bg-blue-700 transition-colors duration-300">Rent this bike</button>
              </div>
            ))
          ) : (
            <p>No bikes available matching your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
