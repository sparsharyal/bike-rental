import { encryptData, decryptData, hashData } from './encryption';
import { PaymentResponse } from './payments';

interface SecurePaymentData {
  amount: number;
  orderId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface VerificationResult {
  isValid: boolean;
  details: {
    amount?: number;
    timestamp?: string;
    transactionId?: string;
  };
  error?: string;
}

export class PaymentSecurity {
  private static readonly SECRET_KEY = process.env.PAYMENT_ENCRYPTION_KEY || 'default-secret-key';

  static async encryptPaymentData(data: SecurePaymentData): Promise<string> {
    try {
      const encryptedData = await encryptData(
        JSON.stringify(data),
        this.SECRET_KEY
      );
      return JSON.stringify(encryptedData);
    } catch (error) {
      throw new Error('Failed to encrypt payment data');
    }
  }

  static async decryptPaymentData(encryptedStr: string): Promise<SecurePaymentData> {
    try {
      const encryptedData = JSON.parse(encryptedStr);
      const decryptedStr = await decryptData(encryptedData, this.SECRET_KEY);
      return JSON.parse(decryptedStr);
    } catch (error) {
      throw new Error('Failed to decrypt payment data');
    }
  }

  static generatePaymentSignature(data: SecurePaymentData): string {
    const signatureData = [
      data.orderId,
      data.amount.toString(),
      data.timestamp
    ].join('|');
    return hashData(signatureData);
  }

  static async verifyPaymentSignature(
    data: SecurePaymentData,
    signature: string
  ): Promise<boolean> {
    const expectedSignature = this.generatePaymentSignature(data);
    return expectedSignature === signature;
  }

  static async validatePaymentResponse(
    response: PaymentResponse,
    originalData: SecurePaymentData
  ): Promise<VerificationResult> {
    if (!response.success) {
      return {
        isValid: false,
        details: {},
        error: response.message
      };
    }

    try {
      const isValidAmount = response.amount === originalData.amount;
      const timeDiff = Date.now() - new Date(originalData.timestamp).getTime();
      const isValidTime = timeDiff < 3600000; // 1 hour validity

      return {
        isValid: isValidAmount && isValidTime,
        details: {
          amount: response.amount,
          timestamp: originalData.timestamp,
          transactionId: response.transactionId
        },
        error: !isValidAmount
          ? 'Amount mismatch'
          : !isValidTime
          ? 'Payment session expired'
          : undefined
      };
    } catch (error) {
      return {
        isValid: false,
        details: {},
        error: 'Invalid payment verification data'
      };
    }
  }

  static detectFraudPatterns(data: SecurePaymentData): boolean {
    // Implement fraud detection logic
    const currentTime = new Date().getTime();
    const paymentTime = new Date(data.timestamp).getTime();
    
    // Check for suspicious patterns
    const isValidTimeWindow = currentTime - paymentTime < 300000; // 5 minutes
    const isValidAmount = data.amount > 0 && data.amount < 1000000; // Reasonable amount range
    
    return isValidTimeWindow && isValidAmount;
  }
}