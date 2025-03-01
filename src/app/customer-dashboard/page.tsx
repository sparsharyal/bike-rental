"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingCart } from "lucide-react";

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

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearch(query);
    setFilteredBikes(bikes.filter(bike => bike.name.toLowerCase().includes(query)));
  };

  const rentBike = (bikeId) => {
    fetch(`/api/rentals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bikeId })
    }).then(() => alert("Bike rented successfully!"));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Dashboard</h1>
      <p>Rent and manage your bike bookings here.</p>
      
      {/* Search Bar */}
      <Input
        type="text"
        placeholder="Search bikes..."
        value={search}
        onChange={handleSearch}
        className="mt-4 p-2 border rounded"
      />
      
      {/* Bike Listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {filteredBikes.map((bike) => (
          <Card key={bike.id}>
            <CardHeader>
              <CardTitle>{bike.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Price: ${bike.price_per_hour}/hour</p>
              <p>Location: {bike.location}</p>
              <Button className="mt-2" onClick={() => rentBike(bike.id)}>
                <ShoppingCart className="mr-2" /> Rent Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
