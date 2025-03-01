"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogOut, AlertTriangle, CreditCard, History, Search } from "lucide-react";

export default function CustomerDashboard() {
  const [bikes, setBikes] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredBikes, setFilteredBikes] = useState([]);

  useEffect(() => {
    fetch("/api/bikes")
      .then((res) => res.json())
      .then((data) => {
        setBikes(data);
        setFilteredBikes(data);
      });
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearch(query);
    setFilteredBikes(bikes.filter((bike) => bike.name.toLowerCase().includes(query)));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Header */}
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-green-700">Customer Dashboard</h1>
        <p className="text-gray-600">Manage your bike rentals with ease.</p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-5xl mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search bikes..."
            value={search}
            onChange={handleSearch}
            className="w-full p-3 pl-10 border border-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Bike Listings */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {filteredBikes.length > 0 ? (
          filteredBikes.map((bike) => (
            <Card key={bike.id} className="shadow-md border border-gray-200 rounded-lg">
              <CardHeader>
                <CardTitle className="text-green-700">{bike.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">💰 <b>${bike.price_per_hour}/hour</b></p>
                <p className="text-gray-700">📍 {bike.location}</p>
                <Button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white shadow-md">Rent Now</Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-gray-500 text-center col-span-3">No bikes available.</p>
        )}
      </div>

      {/* Report an Issue */}
      <div className="w-full max-w-5xl mt-8 p-6 bg-white border border-green-400 shadow-md rounded-xl">
        <h2 className="text-xl font-bold text-green-700 flex items-center"><AlertTriangle className="mr-2" /> Report an Issue</h2>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg mt-3 focus:ring-2 focus:ring-green-500"
          placeholder="Describe the issue..."
        />
        <Button className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white shadow-md">Submit Report</Button>
      </div>

      {/* Payment Options */}
      <div className="w-full max-w-5xl mt-8 p-6 bg-white border border-green-400 shadow-md rounded-xl">
        <h2 className="text-xl font-bold text-green-700 flex items-center"><CreditCard className="mr-2" /> Payment Options</h2>
        <div className="mt-4 flex gap-4">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md">Pay with eSewa</Button>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md">Pay with Khalti</Button>
        </div>
      </div>

      {/* Rental History */}
      <div className="w-full max-w-5xl mt-8 p-6 bg-white border border-green-400 shadow-md rounded-xl">
        <h2 className="text-xl font-bold text-green-700 flex items-center"><History className="mr-2" /> Rental History</h2>
        <p className="text-gray-600 mt-2">View your past rentals here. (Coming Soon)</p>
      </div>

      {/* Logout Button */}
      <Button
        onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => (window.location.href = "/auth/login"))}
        className="mt-8 w-full max-w-5xl bg-black hover:bg-gray-800 text-white flex items-center justify-center p-4 rounded-lg shadow-md"
      >
        <LogOut className="mr-2" /> Logout
      </Button>
    </div>
  );
}
