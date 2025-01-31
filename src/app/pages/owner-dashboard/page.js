"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "owner") {
      router.push("/auth/login");
    }
  }, []);

  return <h1>Welcome to Owner Dashboard</h1>;
}
