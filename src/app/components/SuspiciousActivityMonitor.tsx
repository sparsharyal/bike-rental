"use client";

import { useState, useEffect } from 'react';

interface SuspiciousActivity {
  id: string;
  rentalId: string;
  bikeName: string;
  type: 'UNUSUAL_ROUTE' | 'SPEED_VIOLATION' | 'GEOFENCE_BREACH';
  description: string;
  timestamp: Date;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  location: {
    lat: number;
    lng: number;
  };
}

export default function SuspiciousActivityMonitor() {
  const [activities, setActivities] = useState<SuspiciousActivity[]>([]);

  useEffect(() => {
    const fetchSuspiciousActivities = async () => {
      try {
        const response = await fetch('/api/suspicious-activities');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Failed to fetch suspicious activities:', error);
      }
    };

    fetchSuspiciousActivities();
    const interval = setInterval(fetchSuspiciousActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Suspicious Activities</h2>
      {activities.length === 0 ? (
        <p className="text-gray-500">No suspicious activities detected</p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-red-500"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{activity.bikeName}</h3>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(
                    activity.severity
                  )}`}
                >
                  {activity.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}