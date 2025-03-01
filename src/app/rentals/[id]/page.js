"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

export default function RentalDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsData, setGpsData] = useState(null);

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }
    fetchRentalDetails();
    const interval = setInterval(fetchGpsData, 30000); // Update GPS every 30 seconds
    return () => clearInterval(interval);
  }, [id, session]);

  const fetchRentalDetails = async () => {
    try {
      const response = await fetch(`/api/rentals/${id}`);
      if (!response.ok) throw new Error("Failed to fetch rental details");
      const data = await response.json();
      setRental(data);
    } catch (error) {
      toast.error("Error loading rental details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGpsData = async () => {
    if (!rental || rental.status !== "ACTIVE") return;
    try {
      const response = await fetch(`/api/gps/${id}`);
      if (!response.ok) throw new Error("Failed to fetch GPS data");
      const data = await response.json();
      setGpsData(data);
    } catch (error) {
      console.error("Error fetching GPS data:", error);
    }
  };

  const handleStartRental = async () => {
    try {
      const response = await fetch(`/api/rentals/${id}/start`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to start rental");
      toast.success("Rental started successfully!");
      fetchRentalDetails();
    } catch (error) {
      toast.error("Error starting rental");
      console.error(error);
    }
  };

  const handleEndRental = async () => {
    try {
      const response = await fetch(`/api/rentals/${id}/end`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to end rental");
      toast.success("Rental ended successfully!");
      fetchRentalDetails();
    } catch (error) {
      toast.error("Error ending rental");
      console.error(error);
    }
  };

  const handleReportDamage = async (formData) => {
    try {
      const response = await fetch(`/api/rentals/${id}/damage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to report damage");
      toast.success("Damage reported successfully!");
      fetchRentalDetails();
    } catch (error) {
      toast.error("Error reporting damage");
      console.error(error);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Rental not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Rental Details</h1>

        {/* Status Badge */}
        <div className="mb-6">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              rental.status === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : rental.status === "PENDING"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {rental.status}
          </span>
        </div>

        {/* Bike Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Bike Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Model:</span> {rental.bike.model}
              </p>
              <p>
                <span className="font-semibold">Type:</span> {rental.bike.type}
              </p>
              <p>
                <span className="font-semibold">Location:</span>{" "}
                {rental.bike.location}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Rental Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Start Time:</span>{" "}
                {formatDateTime(rental.startTime)}
              </p>
              <p>
                <span className="font-semibold">End Time:</span>{" "}
                {formatDateTime(rental.endTime)}
              </p>
              <p>
                <span className="font-semibold">Total Amount:</span> $
                {rental.totalAmount}
              </p>
            </div>
          </div>
        </div>

        {/* GPS Tracking Map */}
        {rental.status === "ACTIVE" && gpsData && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Live Location</h2>
            <div className="h-64 rounded-lg overflow-hidden">
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={{
                    lat: gpsData.latitude,
                    lng: gpsData.longitude,
                  }}
                  zoom={15}
                >
                  <Marker
                    position={{
                      lat: gpsData.latitude,
                      lng: gpsData.longitude,
                    }}
                  />
                </GoogleMap>
              </LoadScript>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {rental.status === "PENDING" && (
            <button
              onClick={handleStartRental}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Start Rental
            </button>
          )}
          {rental.status === "ACTIVE" && (
            <button
              onClick={handleEndRental}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              End Rental
            </button>
          )}
          <button
            onClick={() => router.push(`/bikes/${rental.bike.id}`)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            View Bike Details
          </button>
        </div>
      </div>
    </div>
  );
}
