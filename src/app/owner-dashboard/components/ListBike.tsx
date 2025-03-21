"use client";
import React, { useState } from "react";

const ListBike = () => {
  const [bike, setBike] = useState({
    name: "",
    description: "",
    price: "",
    location: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBike((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setBike((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', bike.name);
      formData.append('description', bike.description);
      formData.append('price', bike.price);
      formData.append('location', bike.location);
      if (bike.image) {
        formData.append('image', bike.image);
      }

      const response = await fetch('/api/bikes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to list bike');
      }

      const data = await response.json();
      alert('Bike listed successfully!');
      setBike({
        name: '',
        description: '',
        price: '',
        location: '',
        image: null,
      });
    } catch (error) {
      console.error('Error listing bike:', error);
      alert('Failed to list bike. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">List a New Bike</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Bike Name"
          value={bike.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={bike.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price per day"
          value={bike.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={bike.location}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input type="file" onChange={handleImageChange} className="w-full p-2 border rounded" required />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
          List Bike
        </button>
      </form>
    </div>
  );
};

export default ListBike;