"use client";

import { useState, useEffect } from 'react';
import BikeMap from './BikeMap';

interface Location {
  lat: number;
  lng: number;
  timestamp: string;
}

interface BikeTrackerProps {
  bikeId: number;
  isActive: boolean;
}

export default function BikeTracker({ bikeId, isActive }: BikeTrackerProps) {
  const [location, setLocation] = useState<Location | null>(null);
  const [pathHistory, setPathHistory] = useState<Array<{ lat: number; lng: number; }>>([]);

  // Demo coordinates around Kathmandu
  const demoCoordinates = [
    { lat: 27.7172, lng: 85.3240 }, // Thamel
    { lat: 27.7052, lng: 85.3295 }, // Durbar Square
    { lat: 27.7192, lng: 85.3124 }, // Swayambhunath
    { lat: 27.7041, lng: 85.3185 }, // Kalimati
    { lat: 27.7127, lng: 85.3265 }  // New Road
  ];

  useEffect(() => {
    if (!isActive) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      // Simulate movement by cycling through demo coordinates
      const currentLocation = demoCoordinates[currentIndex];
      setLocation({
        ...currentLocation,
        timestamp: new Date().toISOString()
      });
      
      // Add current location to path history
      setPathHistory(prev => [...prev, currentLocation]);

      currentIndex = (currentIndex + 1) % demoCoordinates.length;
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive || !location) return null;

  return (
    <div className="space-y-4">
      <BikeMap location={location} pathHistory={pathHistory} />
      <div className="p-4 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-2">Live Location</h3>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Latitude:</span> {location.lat.toFixed(4)}
          </p>
          <p>
            <span className="font-medium">Longitude:</span> {location.lng.toFixed(4)}
          </p>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(location.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}