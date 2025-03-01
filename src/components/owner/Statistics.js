'use client';

export default function Statistics({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Bikes</h3>
        <p className="text-3xl font-bold text-indigo-600">{stats.totalBikes}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Rentals</h3>
        <p className="text-3xl font-bold text-green-600">{stats.activeRentals}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
        <p className="text-3xl font-bold text-blue-600">Rs. {stats.totalRevenue}</p>
      </div>
    </div>
  );
}
