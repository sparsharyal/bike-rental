"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function GPSMap() {
  const [bikeLocation, setBikeLocation] = useState([27.7172, 85.3240]); // Default: Kathmandu

  useEffect(() => {
    fetch("/api/tracking")
      .then((res) => res.json())
      .then((data) => setBikeLocation([data.lat, data.lng]));
  }, []);

  return (
    <MapContainer center={bikeLocation} zoom={15} style={{ height: "500px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={bikeLocation}>
        <Popup>Bike Location</Popup>
      </Marker>
    </MapContainer>
  );
}
