import { PrismaClient } from '@prisma/client';
import { FraudDetection } from './fraudDetection';
import { PaymentSecurity } from './paymentSecurity';

const prisma = new PrismaClient();

interface MonitoringAlert {
  userId: string;
  alertType: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK';
  reason: string;
  timestamp: Date;
  actionTaken: string;
}

export class FraudMonitoring {
  private static readonly MONITORING_INTERVAL = 60000; // 1 minute
  private static readonly RISK_THRESHOLDS = {
    HIGH: 0.8,
    MEDIUM: 0.5,
    LOW: 0.3
  };

  static async startMonitoring(): Promise<void> {
    setInterval(async () => {
      try {
        await this.monitorTransactions();
        await this.monitorUserBehavior();
        await this.monitorDevicePatterns();
      } catch (error) {
        console.error('Fraud monitoring error:', error);
      }
    }, this.MONITORING_INTERVAL);
  }

  private static async monitorTransactions(): Promise<void> {
    const recentTransactions = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 3600000) // Last hour
        }
      },
      include: {
        rental: {
          include: {
            user: true
          }
        }
      }
    });

    for (const transaction of recentTransactions) {
      const riskScore = await this.calculateTransactionRiskScore(transaction);
      if (riskScore >= this.RISK_THRESHOLDS.HIGH) {
        await this.createAlert({
          userId: transaction.rental.userId,
          alertType: 'HIGH_RISK',
          reason: 'Suspicious transaction pattern detected',
          timestamp: new Date(),
          actionTaken: 'Transaction blocked'
        });

        await prisma.payment.update({
          where: { id: transaction.id },
          data: { status: 'BLOCKED' }
        });
      }
    }
  }

  private static async monitorUserBehavior(): Promise<void> {
    const activeUsers = await prisma.user.findMany({
      where: {
        lastActive: {
          gte: new Date(Date.now() - 86400000) // Last 24 hours
        }
      },
      include: {
        rentals: {
          include: {
            payment: true
          }
        }
      }
    });

    for (const user of activeUsers) {
      const behaviorScore = await FraudDetection.analyzeUserBehavior(user);
      if (behaviorScore.riskLevel >= this.RISK_THRESHOLDS.MEDIUM) {
        await this.createAlert({
          userId: user.id,
          alertType: 'MEDIUM_RISK',
          reason: behaviorScore.reasons.join(', '),
          timestamp: new Date(),
          actionTaken: 'Account flagged for review'
        });
      }
    }
  }

  private static async monitorDevicePatterns(): Promise<void> {
    const recentSessions = await prisma.session.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 3600000) // Last hour
        }
      },
      include: {
        user: true
      }
    });

    const devicePatterns = this.analyzeDevicePatterns(recentSessions);
    for (const [userId, pattern] of Object.entries(devicePatterns)) {
      if (pattern.riskScore >= this.RISK_THRESHOLDS.MEDIUM) {
        await this.createAlert({
          userId,
          alertType: 'MEDIUM_RISK',
          reason: 'Unusual device pattern detected',
          timestamp: new Date(),
          actionTaken: 'Additional verification required'
        });
      }
    }
  }

  private static async calculateTransactionRiskScore(transaction: any): Promise<number> {
    const riskFactors = [
      await FraudDetection.analyzeTransaction(transaction),
      await PaymentSecurity.validatePaymentData(transaction),
      this.checkTransactionVelocity(transaction)
    ];

    return riskFactors.reduce((score, factor) => score + factor.riskScore, 0) / riskFactors.length;
  }

  private static checkTransactionVelocity(transaction: any): { riskScore: number } {
    // Implement transaction velocity checks
    return { riskScore: 0.0 };
  }

  private static analyzeDevicePatterns(sessions: any[]): Record<string, { riskScore: number }> {
    // Implement device pattern analysis
    return {};
  }

  private static async createAlert(alert: MonitoringAlert): Promise<void> {
    await prisma.fraudAlert.create({
      data: {
        userId: alert.userId,
        alertType: alert.alertType,
        reason: alert.reason,
        timestamp: alert.timestamp,
        actionTaken: alert.actionTaken
      }
    });

    // Notify administrators
    console.log('Fraud alert:', alert);
  }
}