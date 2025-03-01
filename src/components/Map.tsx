"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Map({ bikeLocations }) {
  return (
    <MapContainer center={[27.7172, 85.324]} zoom={13} className="h-96 w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {bikeLocations.map((bike) => (
        <Marker key={bike.id} position={[bike.lat, bike.lng]}>
          <Popup>{bike.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}