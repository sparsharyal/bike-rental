import { PrismaClient } from '@prisma/client';
import { SecurePaymentData } from './paymentSecurity';

const prisma = new PrismaClient();

interface FraudDetectionResult {
  isSuspicious: boolean;
  riskScore: number;
  reasons: string[];
}

interface UserBehavior {
  userId: string;
  lastLoginTime: Date;
  failedLoginAttempts: number;
  lastPaymentTime?: Date;
  paymentFrequency: number;
  deviceIds: string[];
  locations: string[];
}

export class FraudDetection {
  private static readonly RISK_THRESHOLD = 0.7;
  private static readonly MAX_PAYMENT_FREQUENCY = 5; // Max payments per hour
  private static readonly SUSPICIOUS_LOGIN_ATTEMPTS = 3;
  private static readonly TIME_WINDOW = 3600000; // 1 hour in milliseconds

  static async analyzeTransaction(data: SecurePaymentData): Promise<FraudDetectionResult> {
    const result: FraudDetectionResult = {
      isSuspicious: false,
      riskScore: 0,
      reasons: []
    };

    const userBehavior = await this.getUserBehavior(data.userId);
    
    // Check payment frequency
    if (this.isHighFrequencyPayment(userBehavior)) {
      result.riskScore += 0.3;
      result.reasons.push('Unusual payment frequency detected');
    }

    // Check location anomaly
    if (await this.isLocationAnomaly(data.userId, data.location)) {
      result.riskScore += 0.25;
      result.reasons.push('Unusual location detected');
    }

    // Check device anomaly
    if (await this.isDeviceAnomaly(data.userId, data.deviceId)) {
      result.riskScore += 0.25;
      result.reasons.push('Unusual device detected');
    }

    // Check amount pattern
    if (await this.isAbnormalAmount(data.amount, data.userId)) {
      result.riskScore += 0.2;
      result.reasons.push('Unusual transaction amount');
    }

    result.isSuspicious = result.riskScore >= this.RISK_THRESHOLD;
    await this.logFraudDetectionResult(data, result);

    return result;
  }

  private static async getUserBehavior(userId: string): Promise<UserBehavior> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        loginHistory: true
      }
    });

    if (!user) throw new Error('User not found');

    return {
      userId: user.id,
      lastLoginTime: user.lastLoginAt,
      failedLoginAttempts: user.failedLoginAttempts,
      lastPaymentTime: user.payments[0]?.createdAt,
      paymentFrequency: user.payments.length,
      deviceIds: user.loginHistory.map(h => h.deviceId),
      locations: user.loginHistory.map(h => h.location)
    };
  }

  private static isHighFrequencyPayment(behavior: UserBehavior): boolean {
    if (!behavior.lastPaymentTime) return false;
    
    const timeSinceLastPayment = Date.now() - behavior.lastPaymentTime.getTime();
    return timeSinceLastPayment < this.TIME_WINDOW && 
           behavior.paymentFrequency > this.MAX_PAYMENT_FREQUENCY;
  }

  private static async isLocationAnomaly(userId: string, location: string): Promise<boolean> {
    const recentLocations = await prisma.loginHistory.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - this.TIME_WINDOW) }
      },
      select: { location: true }
    });

    return !recentLocations.some(l => l.location === location);
  }

  private static async isDeviceAnomaly(userId: string, deviceId: string): Promise<boolean> {
    const knownDevices = await prisma.loginHistory.findMany({
      where: { userId },
      select: { deviceId: true },
      distinct: ['deviceId']
    });

    return !knownDevices.some(d => d.deviceId === deviceId);
  }

  private static async isAbnormalAmount(amount: number, userId: string): Promise<boolean> {
    const averageAmount = await prisma.payment.aggregate({
      where: { userId },
      _avg: { amount: true }
    });

    if (!averageAmount._avg.amount) return false;
    
    const deviation = Math.abs(amount - averageAmount._avg.amount);
    return deviation > averageAmount._avg.amount * 2; // More than 200% deviation
  }

  private static async logFraudDetectionResult(
    data: SecurePaymentData,
    result: FraudDetectionResult
  ): Promise<void> {
    await prisma.fraudDetectionLog.create({
      data: {
        userId: data.userId,
        transactionId: data.transactionId,
        riskScore: result.riskScore,
        isSuspicious: result.isSuspicious,
        reasons: result.reasons,
        deviceId: data.deviceId,
        location: data.location,
        amount: data.amount
      }
    });
  }
}