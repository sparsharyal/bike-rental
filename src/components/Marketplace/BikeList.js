"use client";
import { useState } from "react";

export default function BikeList({ bikes }) {
  const [search, setSearch] = useState("");
  const [filteredBikes, setFilteredBikes] = useState(bikes);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setFilteredBikes(
      bikes.filter((bike) =>
        bike.model.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  return (
    <div>
      <input type="text" placeholder="Search bikes..." value={search} onChange={handleSearch} />
      <div className="bike-grid">
        {filteredBikes.map((bike) => (
          <div key={bike.id} className="bike-card">
            <h3>{bike.model}</h3>
            <p>{bike.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
