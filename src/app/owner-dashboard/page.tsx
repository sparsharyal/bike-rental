"use client";

export default function OwnerDashboard() {
    return (
      <div>
        <h1>Owner Dashboard</h1>
        <p>Manage your bikes and track rentals.</p>
        <button onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => window.location.href = "/auth/login")}>
          Logout
        </button>

      </div>
    );
  }
  