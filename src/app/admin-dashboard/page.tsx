"use client";

import { useState, useEffect } from "react";

interface Owner {
  id: string;
  name: string;
  email: string;
  // Add additional fields if needed
}

export default function AdminDashboard() {
  const [pendingOwners, setPendingOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingOwners = async () => {
      try {
        const response = await fetch("/api/admin/pending-owners");
        if (!response.ok) {
          throw new Error("Failed to fetch pending owners");
        }
        const data: Owner[] = await response.json();
        setPendingOwners(data);
      } catch (err: any) {
        console.error("Error fetching pending owners:", err.message);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOwners();
  }, []);

  const approveOwner = async (ownerId: string) => {
    try {
      const response = await fetch("/api/admin/approve-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerId }),
      });
      if (!response.ok) {
        throw new Error("Failed to approve owner");
      }
      // Remove the approved owner from the list
      setPendingOwners((prev) => prev.filter((owner) => owner.id !== ownerId));
    } catch (err: any) {
      console.error("Error approving owner:", err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <h2>Pending Owner Approvals</h2>
      {loading ? (
        <p>Loading pending approvals...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : pendingOwners.length === 0 ? (
        <p>No pending approvals</p>
      ) : (
        <ul>
          {pendingOwners.map((owner) => (
            <li key={owner.id}>
              {owner.name} ({owner.email}){" "}
              <button onClick={() => approveOwner(owner.id)}>Approve</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
