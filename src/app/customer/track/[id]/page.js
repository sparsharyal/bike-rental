'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import toast from 'react-hot-toast';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const center = {
  lat: 27.7172,
  lng: 85.3240
};

// Demo tracking data for simulation
const demoLocations = [
  { lat: 27.7172, lng: 85.3240 }, // Kathmandu
  { lat: 27.7185, lng: 85.3245 },
  { lat: 27.7195, lng: 85.3255 },
  { lat: 27.7205, lng: 85.3265 },
  { lat: 27.7215, lng: 85.3275 }
];

export default function TrackRental({ params }) {
  const [currentLocation, setCurrentLocation] = useState(center);
  const [rental, setRental] = useState(null);
  const [locationIndex, setLocationIndex] = useState(0);

  useEffect(() => {
    loadRental();
    startTracking();
  }, []);

  async function loadRental() {
    try {
      const response = await fetch(`/api/rentals/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setRental(data);
    } catch (error) {
      toast.error('Failed to load rental details');
    }
  }

  function startTracking() {
    // Simulate movement every 5 seconds
    const interval = setInterval(() => {
      setLocationIndex((prev) => {
        const next = prev + 1;
        if (next >= demoLocations.length) {
          clearInterval(interval);
          return prev;
        }
        setCurrentLocation(demoLocations[next]);
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Track Your Rental</h1>
        {rental && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold">Bike Details</h3>
              <p>{rental.brand} {rental.model}</p>
            </div>
            <div>
              <h3 className="font-semibold">Owner</h3>
              <p>{rental.owner_name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Start Time</h3>
              <p>{new Date(rental.start_date).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-semibold">End Time</h3>
              <p>{new Date(rental.end_date).toLocaleString()}</p>
            </div>
          </div>
        )}

        <LoadScript googleMapsApiKey="demo-key">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentLocation}
            zoom={15}
          >
            <Marker position={currentLocation} />
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}
