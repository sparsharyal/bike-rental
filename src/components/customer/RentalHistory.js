'use client';

import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function RentalHistory({ rentals, onStatusChange }) {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REJECTED: 'bg-red-100 text-red-800'
  };

  async function handlePayment(rental) {
    try {
      const response = await fetch(`/api/payments/${rental.payment_id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }

      toast.success('Payment completed successfully');
      onStatusChange();
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bike Details
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
                  Owner: {rental.owner_name}
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
                  <button
                    onClick={() => handlePayment(rental)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Complete Payment
                  </button>
                )}
                {rental.status === 'ACTIVE' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => window.open(`/customer/track/${rental.id}`, '_blank')}
                      className="text-indigo-600 hover:text-indigo-900 block"
                    >
                      Track Location
                    </button>
                    <button
                      onClick={() => window.open(`/customer/report/${rental.id}`, '_blank')}
                      className="text-red-600 hover:text-red-900 block"
                    >
                      Report Issue
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}

          {rentals.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                No rental history found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
