"use client";

import { useState, useEffect } from "react";

interface Owner {
  id: string;
  name: string;
  email: string;
  // Add additional fields if needed
}

export function AdminDashboard() {
  const [pendingOwners, setPendingOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin/pending-owners")
      .then((res) => res.json())
      .then((data) => {
        setPendingOwners(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <h2 className="text-xl font-semibold">Pending Owner Approvals</h2>
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : pendingOwners.length === 0 ? (
        <p>No pending approvals</p>
      ) : (
        <ul className="mt-4">
          {pendingOwners.map((owner) => (
            <li key={owner.id} className="flex justify-between items-center border-b py-2">
              {owner.name} ({owner.email})
              <Button className="ml-4"><CheckCircle className="mr-2" /> Approve</Button>
            </li>
          ))}
        </ul>
      )}
      <Button
        onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => (window.location.href = "/auth/login"))}
        className="mt-6"
      >
        <LogOut className="mr-2" /> Logout
      </Button>
    </div>
  );
}
