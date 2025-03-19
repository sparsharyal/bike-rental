import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active rentals with their location data
    const activeRentals = await prisma.rental.findMany({
      where: { status: 'ACTIVE' },
      include: {
        bike: true,
        locationHistory: {
          orderBy: { timestamp: 'desc' },
          take: 10
        }
      }
    });

    const suspiciousActivities: SuspiciousActivity[] = [];

    // Analyze each rental for suspicious patterns
    for (const rental of activeRentals) {
      const locations = rental.locationHistory;
      
      if (locations.length >= 2) {
        // Check for unusual speed
        for (let i = 1; i < locations.length; i++) {
          const timeDiff = locations[i].timestamp.getTime() - locations[i-1].timestamp.getTime();
          const distance = calculateDistance(
            locations[i].latitude,
            locations[i].longitude,
            locations[i-1].latitude,
            locations[i-1].longitude
          );
          
          const speedKmH = (distance / 1000) / (timeDiff / 3600000);
          
          if (speedKmH > 50) { // Speed threshold 50 km/h
            suspiciousActivities.push({
              id: `${rental.id}-speed-${i}`,
              rentalId: rental.id,
              bikeName: rental.bike.name,
              type: 'SPEED_VIOLATION',
              description: `Unusual speed detected: ${speedKmH.toFixed(1)} km/h`,
              timestamp: locations[i].timestamp,
              severity: speedKmH > 70 ? 'HIGH' : 'MEDIUM',
              location: {
                lat: locations[i].latitude,
                lng: locations[i].longitude
              }
            });
          }
        }

        // Check for geofence breach (Kathmandu Valley bounds)
        const lastLocation = locations[0];
        const isInKathmanduValley = isWithinBounds(
          lastLocation.latitude,
          lastLocation.longitude,
          { minLat: 27.6, maxLat: 27.8, minLng: 85.2, maxLng: 85.5 }
        );

        if (!isInKathmanduValley) {
          suspiciousActivities.push({
            id: `${rental.id}-geofence`,
            rentalId: rental.id,
            bikeName: rental.bike.name,
            type: 'GEOFENCE_BREACH',
            description: 'Bike detected outside Kathmandu Valley',
            timestamp: lastLocation.timestamp,
            severity: 'HIGH',
            location: {
              lat: lastLocation.latitude,
              lng: lastLocation.longitude
            }
          });
        }
      }
    }

    return NextResponse.json(suspiciousActivities);
  } catch (error) {
    console.error('Error fetching suspicious activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suspicious activities' },
      { status: 500 }
    );
  }
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

  return R * c; // Distance in meters
}

function isWithinBounds(
  lat: number,
  lng: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): boolean {
  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  );
}