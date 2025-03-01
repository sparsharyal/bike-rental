"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit, Trash2, Upload } from "lucide-react";

export default function OwnerDashboard() {
  const [bikes, setBikes] = useState([]);
  const [bikeName, setBikeName] = useState("");
  const [bikePrice, setBikePrice] = useState("");
  const [bikeLocation, setBikeLocation] = useState("");
  const [khaltiQR, setKhaltiQR] = useState(null);
  const [esewaQR, setEsewaQR] = useState(null);

  useEffect(() => {
    fetch("/api/bikes")
      .then((res) => res.json())
      .then((data) => setBikes(data));
  }, []);

  const addBike = () => {
    const newBike = { name: bikeName, price_per_hour: bikePrice, location: bikeLocation };
    fetch("/api/bikes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBike),
    })
      .then((res) => res.json())
      .then((data) => setBikes([...bikes, data]));
  };

  const handleQRUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("qrImage", file);
      formData.append("type", type);

      fetch("/api/uploadQR", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (type === "khalti") setKhaltiQR(data.url);
          if (type === "esewa") setEsewaQR(data.url);
        });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>
      <p>Manage your bike listings and payment QR codes here.</p>

      {/* Add Bike */}
      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-bold">Add a New Bike</h2>
        <Input placeholder="Bike Name" value={bikeName} onChange={(e) => setBikeName(e.target.value)} className="mt-2" />
        <Input placeholder="Price Per Hour" value={bikePrice} onChange={(e) => setBikePrice(e.target.value)} className="mt-2" />
        <Input placeholder="Location" value={bikeLocation} onChange={(e) => setBikeLocation(e.target.value)} className="mt-2" />
        <Button className="mt-2" onClick={addBike}><PlusCircle className="mr-2" /> Add Bike</Button>
      </div>

      {/* Upload QR Codes */}
      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-bold">Upload Payment QR Codes</h2>
        <label className="block mt-2">Khalti QR Code</label>
        <Input type="file" accept="image/*" onChange={(e) => handleQRUpload(e, "khalti")} />
        {khaltiQR && <img src={khaltiQR} alt="Khalti QR" className="mt-2 w-32" />}
        <label className="block mt-4">eSewa QR Code</label>
        <Input type="file" accept="image/*" onChange={(e) => handleQRUpload(e, "esewa")} />
        {esewaQR && <img src={esewaQR} alt="eSewa QR" className="mt-2 w-32" />}
      </div>

      {/* Bike Listings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {bikes.map((bike) => (
          <Card key={bike.id}>
            <CardHeader>
              <CardTitle>{bike.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Price: ${bike.price_per_hour}/hour</p>
              <p>Location: {bike.location}</p>
              <div className="flex gap-2 mt-2">
                <Button className="bg-yellow-500"><Edit className="mr-2" /> Edit</Button>
                <Button className="bg-red-500"><Trash2 className="mr-2" /> Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
