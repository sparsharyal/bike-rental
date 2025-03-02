"use client"; // Mark this component as a Client Component

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Use next/navigation instead of next/router

const Sidebar = () => {
  const router = useRouter(); // Initialize the router

  const menuItems = [
    { name: "Browse Bikes", path: "/customer/bikes" },
    { name: "Rental History", path: "/customer/history" },
    { name: "Payments", path: "/customer/payments" },
  ];

  const handleLogout = () => {
    // Add your logout logic here (e.g., clear tokens, session, etc.)
    console.log("User logged out");

    // Redirect to the login page
    router.push("/auth/login");
  };

  return (
    <aside className="w-1/4 bg-gray-800 text-white p-4 flex flex-col justify-between h-full">
      <div>
        <h2 className="text-xl font-bold">Customer Dashboard</h2>
        <ul className="mt-4">
          {menuItems.map((item) => (
            <li key={item.path} className="py-2">
              <Link href={item.path} className="hover:text-gray-300">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto">
        <button
          onClick={handleLogout} // Add onClick handler for logout
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;