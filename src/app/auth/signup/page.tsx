"use client";

import { useState } from "react";
import Link from "next/link";
import "../../styles/signup.css";

export default function SignUpPage() {
  const [role, setRole] = useState("customer"); // Default role: customer
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Handle form submission for signup
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = "/api/auth/signup"; // Signup endpoint

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, name, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Signup successful!");
        window.location.href = "/auth/login"; // Redirect to login page
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
        <form onSubmit={handleSignUp} className="auth-form">
          <h2>Sign Up</h2>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          </select>
          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account?{" "}
          <Link href="/auth/login" className="login-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
