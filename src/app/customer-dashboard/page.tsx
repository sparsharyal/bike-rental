"use client";

export default function CustomerDashboard() {
    return (
      <div>
        <h1>Customer Dashboard</h1>
        <p>Rent and manage your bike bookings here.</p>
        <button onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => window.location.href = "/auth/login")}>
          Logout
        </button>

      </div>
    );
  }
  