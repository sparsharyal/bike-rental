"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function OwnerBikes() {
  const { data: session } = useSession();
  const router = useRouter();
  const [bikes, setBikes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    model: "",
    type: "",
    description: "",
    hourlyRate: "",
    location: "",
    latitude: "",
    longitude: "",
    images: [],
  });

  useEffect(() => {
    if (!session || session.user.role !== "OWNER") {
      router.push("/auth/signin");
      return;
    }
    fetchBikes();
  }, [session]);

  const fetchBikes = async () => {
    try {
      const response = await fetch("/api/owner/bikes");
      if (!response.ok) throw new Error("Failed to fetch bikes");
      const data = await response.json();
      const bikesWithParsedImages = data.map((bike) => ({
        ...bike,
        images: JSON.parse(bike.images || '[]'),
      }));
      setBikes(bikesWithParsedImages);
    } catch (error) {
      toast.error("Error loading bikes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((images) => {
      setFormData((prev) => ({ ...prev, images }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/bikes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images: formData.images,
        }),
      });

      if (!response.ok) throw new Error("Failed to add bike");

      toast.success("Bike added successfully!");
      setShowAddModal(false);
      setFormData({
        model: "",
        type: "",
        description: "",
        hourlyRate: "",
        location: "",
        latitude: "",
        longitude: "",
        images: [],
      });
      fetchBikes();
    } catch (error) {
      toast.error("Error adding bike");
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Bikes</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Add New Bike
        </button>
      </div>

      {/* Bikes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bikes.map((bike) => (
          <div
            key={bike.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="aspect-w-16 aspect-h-9">
              {bike.images && bike.images[0] && (
                <img
                  src={bike.images[0]}
                  alt={bike.model}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{bike.model}</h3>
              <p className="text-gray-600 mb-2">{bike.type}</p>
              <p className="text-gray-800 font-bold mb-2">
                ${bike.hourlyRate}/hour
              </p>
              <p className="text-gray-600 mb-4"> {bike.location}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/bikes/${bike.id}`)}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => router.push(`/owner/bikes/${bike.id}/edit`)}
                  className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Bike Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Add New Bike</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="">Select Type</option>
                  <option value="mountain">Mountain Bike</option>
                  <option value="road">Road Bike</option>
                  <option value="city">City Bike</option>
                  <option value="electric">Electric Bike</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.hourlyRate}
                  onChange={(e) =>
                    setFormData({ ...formData, hourlyRate: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Latitude
                  </label>
                  <input
                    type="number"
                    required
                    step="any"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Longitude
                  </label>
                  <input
                    type="number"
                    required
                    step="any"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Add Bike
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
