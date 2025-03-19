"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface BikeMapProps {
  location: {
    lat: number;
    lng: number;
  } | null;
  pathHistory: Array<{
    lat: number;
    lng: number;
  }>;
}

export default function BikeMap({ location, pathHistory }: BikeMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pathRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    // Initialize map if it hasn't been initialized yet
    if (!mapRef.current && location) {
      mapRef.current = L.map('bike-map').setView([location.lat, location.lng], 15);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Create marker with custom icon
      const bikeIcon = L.icon({
        iconUrl: '/images/bike-marker.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      markerRef.current = L.marker([location.lat, location.lng], { icon: bikeIcon })
        .addTo(mapRef.current);
    }

    // Update marker position and path
    if (mapRef.current && location) {
      if (markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lng]);
      }

      // Update path
      if (pathHistory.length > 1) {
        if (pathRef.current) {
          pathRef.current.remove();
        }
        pathRef.current = L.polyline(pathHistory, {
          color: '#3B82F6',
          weight: 3,
          opacity: 0.7
        }).addTo(mapRef.current);
      }

      // Center map on current location
      mapRef.current.setView([location.lat, location.lng]);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        pathRef.current = null;
      }
    };
  }, [location, pathHistory]);

  return (
    <div id="bike-map" className="w-full h-[400px] rounded-lg overflow-hidden shadow-md" />
  );
}