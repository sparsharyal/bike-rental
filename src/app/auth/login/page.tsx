"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../styles/login.css";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer"); // Default role selection
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
        credentials: "include", // ✅ Allow cookies in fetch request
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token); // ✅ Store token
        localStorage.setItem("role", result.user.role); // ✅ Store role

        // ✅ Redirect based on role
        switch (result.user.role) {
          case "admin":
            router.push("/pages/admin-dashboard");
            break;
          case "owner":
            router.push("/pages/owner-dashboard");
            break;
          case "customer":
            router.push("/pages/customer-dashboard");
            break;
          default:
            router.push("/pages/customer-dashboard");
        }
      } else {
        alert(result.message || "Invalid credentials!");
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
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="customer">Customer</option>
          </select>
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
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account?{" "}
          <Link href="/auth/signup" className="Signup-link">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}
