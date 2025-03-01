"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const handleDeleteUser = (userId) => {
    fetch(`/api/users/${userId}`, { method: "DELETE" })
      .then(() => setUsers(users.filter((user) => user.id !== userId)));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">Manage users and monitor system activities.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {users.map((user) => (
          <Card key={user.id} className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-red-700">{user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Role: {user.role}</p>
              <Button onClick={() => handleDeleteUser(user.id)} className="mt-2 bg-red-500 text-white">
                Delete User
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={() => {
          fetch("/api/auth/logout", { method: "POST" }).then(() => {
            router.push("/auth/login");
          });
        }}
        className="mt-6 bg-red-500 text-white"
      >
        <LogOut className="mr-2" /> Logout
      </Button>
    </div>
  );
}
