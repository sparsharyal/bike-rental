"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

export default function BikeDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rentalDuration, setRentalDuration] = useState(1);

  useEffect(() => {
    fetchBikeDetails();
  }, [id]);

  const fetchBikeDetails = async () => {
    try {
      const response = await fetch(`/api/bikes/${id}`);
      if (!response.ok) throw new Error("Failed to fetch bike details");
      const data = await response.json();
      setBike(data);
    } catch (error) {
      toast.error("Error loading bike details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRent = async () => {
    if (!session) {
      toast.error("Please sign in to rent a bike");
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bikeId: id,
          duration: rentalDuration,
        }),
      });

      if (!response.ok) throw new Error("Failed to create rental");

      const data = await response.json();
      toast.success("Rental created successfully!");
      router.push(`/rentals/${data.id}`);
    } catch (error) {
      toast.error("Error creating rental");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Bike not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bike Images */}
        <div className="space-y-4">
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
            {bike.images && bike.images[0] && (
              <img
                src={bike.images[0]}
                alt={bike.model}
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {bike.images?.slice(1).map((image, index) => (
              <div
                key={index}
                className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden"
              >
                <img
                  src={image}
                  alt={`${bike.model} - ${index + 2}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bike Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{bike.model}</h1>
            <p className="text-gray-600">{bike.type}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{bike.description}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Location</h2>
            <p className="text-gray-700 mb-4">📍 {bike.location}</p>
            <div className="h-64 rounded-lg overflow-hidden">
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={{ lat: bike.latitude, lng: bike.longitude }}
                  zoom={15}
                >
                  <Marker
                    position={{ lat: bike.latitude, lng: bike.longitude }}
                  />
                </GoogleMap>
              </LoadScript>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Rental Details</h2>
            <p className="text-2xl font-bold text-indigo-600 mb-4">
              ${bike.hourlyRate}/hour
            </p>
            <div className="flex items-center space-x-4 mb-4">
              <label className="text-gray-700">Hours:</label>
              <input
                type="number"
                min="1"
                value={rentalDuration}
                onChange={(e) => setRentalDuration(parseInt(e.target.value))}
                className="border rounded px-3 py-2 w-24"
              />
            </div>
            <div className="text-lg font-semibold mb-4">
              Total: ${(bike.hourlyRate * rentalDuration).toFixed(2)}
            </div>
            <button
              onClick={handleRent}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Rent Now
            </button>
          </div>

          {bike.reviews && bike.reviews.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Reviews</h2>
              <div className="space-y-4">
                {bike.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="text-yellow-400">{"★".repeat(review.rating)}</div>
                      <div className="text-gray-400">{"★".repeat(5 - review.rating)}</div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
