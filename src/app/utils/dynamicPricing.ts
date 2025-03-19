import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PricingFactors {
  baseFare: number;
  demandMultiplier: number;
  locationMultiplier: number;
  timeMultiplier: number;
  weatherMultiplier: number;
  seasonalMultiplier: number;
  historicalDemandMultiplier: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  popularityScore: number;
}

export class DynamicPricing {
  private static readonly BASE_FARE = 100; // Base fare in NPR
  private static readonly MAX_DEMAND_MULTIPLIER = 2.5;
  private static readonly MAX_LOCATION_MULTIPLIER = 1.5;
  private static readonly PEAK_HOUR_MULTIPLIER = 1.3;
  private static readonly MAX_WEATHER_MULTIPLIER = 1.4;
  private static readonly MAX_SEASONAL_MULTIPLIER = 1.3;
  private static readonly MAX_HISTORICAL_DEMAND_MULTIPLIER = 1.4;
  private static readonly WEATHER_PENALTY = 0.8; // Multiplier for bad weather
  private static readonly OFF_SEASON_MULTIPLIER = 0.9;

  static async calculatePrice(bikeId: string, duration: number): Promise<number> {
    const factors = await this.getPricingFactors(bikeId);
    const totalFare = this.BASE_FARE * duration * (
      factors.demandMultiplier *
      factors.locationMultiplier *
      factors.timeMultiplier *
      factors.weatherMultiplier *
      factors.seasonalMultiplier *
      factors.historicalDemandMultiplier
    );

    return Math.round(totalFare);
  }

  private static async getPricingFactors(bikeId: string): Promise<PricingFactors> {
    const [bike, totalRentals, activeRentals, historicalRentals] = await Promise.all([
      prisma.bike.findUnique({
        where: { id: bikeId },
        include: { location: true }
      }),
      prisma.rental.count(),
      prisma.rental.count({
        where: { status: 'ACTIVE' }
      }),
      prisma.rental.findMany({
        where: {
          bikeId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    if (!bike) throw new Error('Bike not found');

    return {
      baseFare: this.BASE_FARE,
      demandMultiplier: this.calculateDemandMultiplier(totalRentals, activeRentals),
      locationMultiplier: this.calculateLocationMultiplier(bike.location),
      timeMultiplier: this.calculateTimeMultiplier(),
      weatherMultiplier: await this.calculateWeatherMultiplier(bike.location),
      seasonalMultiplier: this.calculateSeasonalMultiplier(),
      historicalDemandMultiplier: this.calculateHistoricalDemandMultiplier(historicalRentals)
    };
  }

  private static calculateDemandMultiplier(totalRentals: number, activeRentals: number): number {
    const demandRatio = activeRentals / Math.max(totalRentals, 1);
    const multiplier = 1 + (demandRatio * (this.MAX_DEMAND_MULTIPLIER - 1));
    return Math.min(multiplier, this.MAX_DEMAND_MULTIPLIER);
  }

  private static async calculateLocationMultiplier(location: LocationData): Promise<number> {
    if (!location) return 1;

    const [popularityFactor, nearbyEvents] = await Promise.all([
      this.getLocationPopularity(location),
      this.checkNearbyEvents(location)
    ]);

    let multiplier = 1 + (popularityFactor * (this.MAX_LOCATION_MULTIPLIER - 1));
    
    // Adjust for nearby events
    if (nearbyEvents.length > 0) {
      const eventFactor = Math.min(nearbyEvents.length * 0.2, 0.5); // Up to 50% increase for events
      multiplier *= (1 + eventFactor);
    }

    return Math.min(multiplier, this.MAX_LOCATION_MULTIPLIER);
  }

  private static async getLocationPopularity(location: LocationData): Promise<number> {
    const recentRentals = await prisma.rental.count({
      where: {
        bike: {
          location: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        },
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last week
        }
      }
    });

    return Math.min(recentRentals / 50, 1); // Normalize popularity (assuming 50 rentals/week is max)
  }

  private static async checkNearbyEvents(location: LocationData): Promise<any[]> {
    try {
      // Fetch events from external API or database
      const response = await fetch(
        `https://api.example.com/events?lat=${location.latitude}&lon=${location.longitude}&radius=5000`
      );
      const events = await response.json();
      return events.filter((event: any) => {
        const eventDate = new Date(event.date);
        const now = new Date();
        // Consider events happening within next 24 hours
        return eventDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000;
      });
    } catch (error) {
      console.error('Events API error:', error);
      return [];
    }
  }

  private static calculateTimeMultiplier(): number {
    const hour = new Date().getHours();
    const isPeakHour = (hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 19);
    return isPeakHour ? this.PEAK_HOUR_MULTIPLIER : 1;
  }

  private static async calculateWeatherMultiplier(location: LocationData): Promise<number> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${process.env.WEATHER_API_KEY}`
      );
      const data = await response.json();
      
      // Adjust multiplier based on weather conditions and temperature
      const weatherId = data.weather[0].id;
      const temp = data.main.temp - 273.15; // Convert Kelvin to Celsius
      let multiplier = 1.0;

      // Weather condition adjustments
      if (weatherId >= 200 && weatherId < 300) { // Thunderstorm
        multiplier *= 0.7;
      } else if (weatherId >= 300 && weatherId < 500) { // Drizzle
        multiplier *= 0.9;
      } else if (weatherId >= 500 && weatherId < 600) { // Rain
        multiplier *= 0.8;
      } else if (weatherId >= 600 && weatherId < 700) { // Snow
        multiplier *= 0.7;
      } else if (weatherId >= 700 && weatherId < 800) { // Atmosphere
        multiplier *= 0.9;
      } else if (weatherId === 800) { // Clear sky
        multiplier *= 1.2;
      }

      // Temperature adjustments
      if (temp < 10) {
        multiplier *= 0.9; // Cold weather discount
      } else if (temp > 30) {
        multiplier *= 0.95; // Hot weather discount
      } else if (temp >= 18 && temp <= 25) {
        multiplier *= 1.1; // Perfect weather premium
      }

      return Math.min(multiplier, this.MAX_WEATHER_MULTIPLIER);
    } catch (error) {
      console.error('Weather API error:', error);
      return 1; // Default multiplier if weather data is unavailable
    }
  }

  private static calculateSeasonalMultiplier(): number {
    const month = new Date().getMonth();
    // Peak season: March to May (2-4) and September to November (8-10)
    const isPeakSeason = (month >= 2 && month <= 4) || (month >= 8 && month <= 10);
    return isPeakSeason ? this.MAX_SEASONAL_MULTIPLIER : this.OFF_SEASON_MULTIPLIER;
  }

  private static calculateHistoricalDemandMultiplier(historicalRentals: any[]): number {
    const rentalsCount = historicalRentals.length;
    // Normalize historical demand (0-1 scale)
    const normalizedDemand = Math.min(rentalsCount / 30, 1); // Assuming max 1 rental per day is normal
    return 1 + (normalizedDemand * (this.MAX_HISTORICAL_DEMAND_MULTIPLIER - 1));
  }

  static async getPriceBreakdown(bikeId: string, duration: number): Promise<PricingFactors> {
    return this.getPricingFactors(bikeId);
  }

  static async updateLocationPopularity(locationId: string, rentalsCount: number): Promise<void> {
    const popularityScore = Math.min(rentalsCount * 10, 100);
    await prisma.location.update({
      where: { id: locationId },
      data: { popularityScore }
    });
  }
}