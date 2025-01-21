"use client";

import { useState } from "react";
import Link from "next/link";
import "../../styles/login.css";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer"); // Default role: customer

  // Handle form submission for login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = "/api/auth/login"; // Login endpoint

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const result = await response.json();

      if (response.ok) {
        if (role === "admin") {
          alert("Admin login successful!");
          window.location.href = "/admin-dashboard"; // Redirect admin
        } else if (role === "owner") {
          alert("Owner login successful!");
          window.location.href = "/owner-dashboard"; // Redirect owner
        } else {
          alert("Customer login successful!");
          window.location.href = "/dashboard"; // Redirect customer
        }
      } else {
        alert(result.message || "An error occurred!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="auth-page">
      <div className="form-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Login</button>
        </form>
        <p>
        Already have an account?{" "}
        <Link href="/auth/signup" className="Signup-link">
          Signup
        </Link>
      </p>
      </div>
    </div>
  );
}
