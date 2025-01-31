"use client";
import { useState } from "react";

export default function DamageReport() {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("description", description);
    formData.append("image", image);

    await fetch("/api/report", { method: "POST", body: formData });
  };

  return (
    <div className="damage-report">
      <h2>Report Damage</h2>
      <form onSubmit={handleSubmit}>
        <textarea placeholder="Describe the issue..." onChange={(e) => setDescription(e.target.value)} required />
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
}
