"use client";

import { useState } from "react";
import Link from "next/link";
import "../../styles/signup.css";

export default function SignUpPage() {
  const [role, setRole] = useState("CUSTOMER"); // Default to uppercase
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role.toUpperCase(), name, email, password }), // Convert role
      });

      const text = await response.text();
      console.log("Response text:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch (err) {
        console.error("JSON Parse Error:", err);
        alert("Invalid response from server");
        return;
      }

      if (response.ok) {
        alert("Signup successful!");
        window.location.href = "/auth/login";
      } else {
        alert(result.message || "An error occurred!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
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
          <select value={role} onChange={(e) => setRole(e.target.value.toUpperCase())} required>
            <option value="CUSTOMER">Customer</option>
            <option value="OWNER">Owner</option>
          </select>
          <button type="submit" disabled={loading}>{loading ? "Signing Up..." : "Sign Up"}</button>
        </form>
        <p>
          Already have an account? <Link href="/auth/login" className="login-link">Login</Link>
        </p>
      </div>
    </div>
  );
}
