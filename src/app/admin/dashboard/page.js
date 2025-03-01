'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBikes: 0,
    totalRentals: 0,
    pendingOwners: 0
  });
  const [pendingOwners, setPendingOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchAdminData();
    }
  }, [session, status, router]);

  const fetchAdminData = async () => {
    try {
      const [statsRes, ownersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/pending-owners')
      ]);

      const [statsData, ownersData] = await Promise.all([
        statsRes.json(),
        ownersRes.json()
      ]);

      setStats(statsData);
      setPendingOwners(ownersData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOwner = async (userId) => {
    try {
      const res = await fetch(`/api/admin/approve-owner/${userId}`, {
        method: 'PUT'
      });

      if (!res.ok) {
        throw new Error('Failed to approve owner');
      }

      // Refresh data
      fetchAdminData();
    } catch (error) {
      console.error('Error approving owner:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 mb-2">Total Bikes</h3>
          <p className="text-3xl font-bold">{stats.totalBikes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 mb-2">Total Rentals</h3>
          <p className="text-3xl font-bold">{stats.totalRentals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-600 mb-2">Pending Owners</h3>
          <p className="text-3xl font-bold">{stats.pendingOwners}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/admin/users')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Manage Users
            </button>
            <button
              onClick={() => router.push('/admin/bikes')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              Manage Bikes
            </button>
            <button
              onClick={() => router.push('/admin/rentals')}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              View Rentals
            </button>
          </div>
        </div>

        {/* Pending Owner Approvals */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Pending Owner Approvals</h2>
          {pendingOwners.length > 0 ? (
            <div className="space-y-4">
              {pendingOwners.map(owner => (
                <div key={owner.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{owner.name}</p>
                    <p className="text-sm text-gray-600">{owner.email}</p>
                  </div>
                  <button
                    onClick={() => handleApproveOwner(owner.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No pending approvals</p>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Database Connection</p>
              <p className="text-sm text-gray-600">MySQL</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
              Connected
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">API Status</p>
              <p className="text-sm text-gray-600">REST API</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
              Operational
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">Authentication</p>
              <p className="text-sm text-gray-600">NextAuth.js</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
