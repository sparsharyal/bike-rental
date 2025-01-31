"use client";
import { useEffect, useState } from "react";

export default function Marketplace() {
  const [bikes, setBikes] = useState([]);

  useEffect(() => {
    fetch("/api/bikes")
      .then((res) => res.json())
      .then((data) => setBikes(data));
  }, []);

  return (
    <div className="marketplace-container">
      <h1>Available Bikes</h1>
      <div className="bike-list">
        {bikes.map((bike) => (
          <div key={bike.id} className="bike-card">
            <img src={bike.image} alt={bike.model} />
            <h3>{bike.model}</h3>
            <p>Price: {bike.price} NPR/day</p>
            <p>Location: {bike.location}</p>
            <button>Rent Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
