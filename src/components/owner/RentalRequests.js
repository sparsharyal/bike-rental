'use client';

import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function RentalRequests({ rentals, onUpdate }) {
  async function handleAction(rentalId, action) {
    try {
      const response = await fetch(`/api/rentals/${rentalId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update rental status');
      }

      toast.success('Rental status updated');
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    }
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REJECTED: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bike
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Renter
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rental Period
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rentals.map((rental) => (
            <tr key={rental.id}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {rental.brand} {rental.model}
                </div>
                <div className="text-sm text-gray-500">
                  Type: {rental.type}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {rental.renter_name}
                </div>
                <div className="text-sm text-gray-500">
                  {rental.renter_email}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  From: {format(new Date(rental.start_date), 'PPp')}
                </div>
                <div className="text-sm text-gray-900">
                  To: {format(new Date(rental.end_date), 'PPp')}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  Rs. {rental.total_amount}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[rental.status]}`}>
                  {rental.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {rental.status === 'PENDING' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAction(rental.id, 'APPROVED')}
                      className="text-indigo-600 hover:text-indigo-900 block"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(rental.id, 'REJECTED')}
                      className="text-red-600 hover:text-red-900 block"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {rental.status === 'APPROVED' && !rental.payment_completed && (
                  <span className="text-yellow-600">
                    Awaiting Payment
                  </span>
                )}
                {rental.status === 'APPROVED' && rental.payment_completed && (
                  <button
                    onClick={() => handleAction(rental.id, 'ACTIVE')}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Start Rental
                  </button>
                )}
                {rental.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleAction(rental.id, 'COMPLETED')}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Complete Rental
                  </button>
                )}
              </td>
            </tr>
          ))}

          {rentals.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                No rental requests found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
