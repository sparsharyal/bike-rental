"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function TrackRentals() {
  const [bikeLocations, setBikeLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/track-bike")
      .then((res) => res.json())
      .then((data) => {
        setBikeLocations(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Track Rented Bikes</h1>
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Map bikeLocations={bikeLocations} />
      )}
    </div>
  );
}