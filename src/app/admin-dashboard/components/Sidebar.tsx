import React from "react";
import Link from "next/link";

const Sidebar = () => {
  const menuItems = [
    { name: "Manage Users", path: "/admin/manage-users" },
    { name: "Monitor Rentals", path: "/admin/monitor-rentals" },
    { name: "Fraud Detection", path: "/admin/fraud-detection" },
  ];

  return (
    <aside className="w-1/4 bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold">Admin Dashboard</h2>
      <ul className="mt-4">
        {menuItems.map((item) => (
          <li key={item.path} className="py-2">
            <Link href={item.path} className="hover:text-gray-300">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
