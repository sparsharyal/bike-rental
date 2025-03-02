"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import DashboardContent from "./components/DashboardContent";

const CustomerDashboard = () => {
  return (
    <div className="flex h-screen">
      <Sidebar/>
      <div className="w-3/4 p-6">
        <Navbar/>
        <DashboardContent/>
      </div>
    </div>
  );
};

export default CustomerDashboard;