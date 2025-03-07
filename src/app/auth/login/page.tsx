"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../styles/login.css";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const result = await response.json();
      console.log("Login Response:", result);

      if (response.ok) {
        document.cookie = `token=${result.token}; path=/; Secure; HttpOnly; SameSite=Strict`; // Set cookie
        document.cookie = `role=${result.role}; path=/; Secure; SameSite=Strict`; // Store role

        // Redirect based on role
        if (result.role === "ADMIN") {
          router.push("/admin-dashboard");
        } else if (result.role === "OWNER") {
          router.push("/owner-dashboard");
        } else {
          router.push("/customer-dashboard");
        }
      } else {
        setError(result.message || "Invalid login credentials!");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="form-container">
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Login</h2>

          {error && <p className="error-message">{error}</p>}

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

          <select value={role} onChange={(e) => setRole(e.target.value.toUpperCase())}>
            <option value="CUSTOMER">Customer</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button type="submit">Login</button>
        </form>

        <p>
          Don't have an account?{" "}
          <Link href="/auth/signup" className="Signup-link">
            <b>
            Signup
            </b>
          </Link>
        </p>
      </div>
    </div>
  );
}
