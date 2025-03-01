'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';

export default function AvailableBikes({ bikes, onRent }) {
  const [selectedBike, setSelectedBike] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showQR, setShowQR] = useState(false);

  async function handleRent(e) {
    e.preventDefault();

    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    const hours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
    const totalAmount = hours * selectedBike.hourly_rate;

    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bikeId: selectedBike.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalAmount,
          paymentMethod: 'DIGITAL_WALLET'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setShowQR(true);
      toast.success('Rental created! Please complete the payment');
      onRent();
    } catch (error) {
      toast.error(error.message || 'Failed to create rental');
    }
  }

  function handleCancel() {
    setSelectedBike(null);
    setStartDate(null);
    setEndDate(null);
    setShowQR(false);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bikes.map((bike) => (
        <div key={bike.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative h-48">
            <Image
              src={bike.images?.[0] || '/images/default-bike.jpg'}
              alt={bike.model}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">{bike.brand} {bike.model}</h3>
            <p className="text-gray-600 mb-2">{bike.description}</p>
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-gray-600">Type:</span> {bike.type}
              </div>
              <div className="text-green-600 font-semibold">
                Rs. {bike.hourly_rate}/hour
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Location: {bike.location}
              </div>
              <button
                onClick={() => setSelectedBike(bike)}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Rent Now
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Rental Modal */}
      {selectedBike && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Rent {selectedBike.brand} {selectedBike.model}</h2>
            
            {!showQR ? (
              <form onSubmit={handleRent}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <DatePicker
                      selected={startDate}
                      onChange={setStartDate}
                      showTimeSelect
                      dateFormat="Pp"
                      minDate={new Date()}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <DatePicker
                      selected={endDate}
                      onChange={setEndDate}
                      showTimeSelect
                      dateFormat="Pp"
                      minDate={startDate || new Date()}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  {startDate && endDate && (
                    <div className="text-lg font-semibold text-green-600">
                      Total: Rs. {Math.ceil((endDate - startDate) / (1000 * 60 * 60)) * selectedBike.hourly_rate}
                    </div>
                  )}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      Confirm Rental
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <QRCode value="https://example.com/payment" />
                </div>
                <p className="text-center text-gray-600">
                  Scan this QR code to complete your payment
                </p>
                <button
                  onClick={handleCancel}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {bikes.length === 0 && (
        <div className="col-span-full text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">No bikes available matching your criteria</p>
        </div>
      )}
    </div>
  );
}
