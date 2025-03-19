"use client";

import { useState, useEffect } from 'react';

interface MovementPattern {
  type: 'CIRCULAR' | 'ZIGZAG' | 'STATIONARY' | 'LINEAR';
  confidence: number;
  duration: number;
  distance: number;
}

interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

interface MovementPatternAnalyzerProps {
  bikeId: number;
  onPatternDetected?: (pattern: MovementPattern) => void;
}

export default function MovementPatternAnalyzer({ bikeId, onPatternDetected }: MovementPatternAnalyzerProps) {
  const [pattern, setPattern] = useState<MovementPattern | null>(null);
  const [locationHistory, setLocationHistory] = useState<Location[]>([]);

  useEffect(() => {
    const fetchLocationHistory = async () => {
      try {
        const response = await fetch(`/api/bikes/${bikeId}/locations?limit=20`);
        const data = await response.json();
        setLocationHistory(data.map((loc: any) => ({
          ...loc,
          timestamp: new Date(loc.timestamp)
        })));
      } catch (error) {
        console.error('Failed to fetch location history:', error);
      }
    };

    fetchLocationHistory();
    const interval = setInterval(fetchLocationHistory, 30000);
    return () => clearInterval(interval);
  }, [bikeId]);

  useEffect(() => {
    if (locationHistory.length < 3) return;

    const pattern = analyzeMovementPattern(locationHistory);
    setPattern(pattern);
    onPatternDetected?.(pattern);
  }, [locationHistory, onPatternDetected]);

  const analyzeMovementPattern = (locations: Location[]): MovementPattern => {
    const distances = calculateDistances(locations);
    const angles = calculateAngles(locations);
    const timeIntervals = calculateTimeIntervals(locations);
    
    // Detect stationary pattern
    if (isStationary(distances)) {
      return {
        type: 'STATIONARY',
        confidence: 0.9,
        duration: timeIntervals.reduce((a, b) => a + b, 0),
        distance: distances.reduce((a, b) => a + b, 0)
      };
    }

    // Detect circular pattern
    if (isCircular(angles)) {
      return {
        type: 'CIRCULAR',
        confidence: 0.8,
        duration: timeIntervals.reduce((a, b) => a + b, 0),
        distance: distances.reduce((a, b) => a + b, 0)
      };
    }

    // Detect zigzag pattern
    if (isZigzag(angles)) {
      return {
        type: 'ZIGZAG',
        confidence: 0.7,
        duration: timeIntervals.reduce((a, b) => a + b, 0),
        distance: distances.reduce((a, b) => a + b, 0)
      };
    }

    // Default to linear pattern
    return {
      type: 'LINEAR',
      confidence: 0.6,
      duration: timeIntervals.reduce((a, b) => a + b, 0),
      distance: distances.reduce((a, b) => a + b, 0)
    };
  };

  const calculateDistances = (locations: Location[]): number[] => {
    const distances: number[] = [];
    for (let i = 1; i < locations.length; i++) {
      distances.push(
        calculateDistance(
          locations[i-1].latitude,
          locations[i-1].longitude,
          locations[i].latitude,
          locations[i].longitude
        )
      );
    }
    return distances;
  };

  const calculateAngles = (locations: Location[]): number[] => {
    const angles: number[] = [];
    for (let i = 1; i < locations.length - 1; i++) {
      angles.push(
        calculateBearing(
          locations[i-1].latitude,
          locations[i-1].longitude,
          locations[i].latitude,
          locations[i].longitude,
          locations[i+1].latitude,
          locations[i+1].longitude
        )
      );
    }
    return angles;
  };

  const calculateTimeIntervals = (locations: Location[]): number[] => {
    const intervals: number[] = [];
    for (let i = 1; i < locations.length; i++) {
      intervals.push(
        locations[i].timestamp.getTime() - locations[i-1].timestamp.getTime()
      );
    }
    return intervals;
  };

  const isStationary = (distances: number[]): boolean => {
    const totalDistance = distances.reduce((a, b) => a + b, 0);
    return totalDistance < 50; // Less than 50 meters total movement
  };

  const isCircular = (angles: number[]): boolean => {
    const totalAngle = angles.reduce((a, b) => a + Math.abs(b), 0);
    return Math.abs(totalAngle - 360) < 45; // Within 45 degrees of a complete circle
  };

  const isZigzag = (angles: number[]): boolean => {
    let alternatingCount = 0;
    for (let i = 1; i < angles.length; i++) {
      if (Math.sign(angles[i]) !== Math.sign(angles[i-1])) {
        alternatingCount++;
      }
    }
    return alternatingCount >= angles.length * 0.6; // At least 60% alternating angles
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Movement Pattern Analysis</h3>
      {pattern ? (
        <div className="space-y-2">
          <p>
            <span className="font-medium">Pattern Type:</span>{' '}
            <span className={`px-2 py-1 rounded text-sm ${getPatternColor(pattern.type)}`}>
              {pattern.type}
            </span>
          </p>
          <p>
            <span className="font-medium">Confidence:</span>{' '}
            {(pattern.confidence * 100).toFixed(1)}%
          </p>
          <p>
            <span className="font-medium">Duration:</span>{' '}
            {formatDuration(pattern.duration)}
          </p>
          <p>
            <span className="font-medium">Distance:</span>{' '}
            {(pattern.distance / 1000).toFixed(2)} km
          </p>
        </div>
      ) : (
        <p className="text-gray-500">Analyzing movement pattern...</p>
      )}
    </div>
  );
}

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  lat3: number,
  lon3: number
): number {
  const bearing1 = Math.atan2(
    Math.sin(lon2 - lon1) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
  );

  const bearing2 = Math.atan2(
    Math.sin(lon3 - lon2) * Math.cos(lat3),
    Math.cos(lat2) * Math.sin(lat3) -
    Math.sin(lat2) * Math.cos(lat3) * Math.cos(lon3 - lon2)
  );

  return ((bearing2 - bearing1) * 180 / Math.PI + 360) % 360;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function getPatternColor(type: string): string {
  switch (type) {
    case 'CIRCULAR':
      return 'bg-blue-100 text-blue-800';
    case 'ZIGZAG':
      return 'bg-yellow-100 text-yellow-800';
    case 'STATIONARY':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}