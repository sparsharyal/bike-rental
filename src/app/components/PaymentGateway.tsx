"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { initiateKhaltiPayment, initiateEsewaPayment } from '@/app/utils/payments';
import { PaymentSecurity } from '@/app/utils/paymentSecurity';
import { LockClosedIcon, CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface PaymentGatewayProps {
  amount: number;
  rentalId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function PaymentGateway({
  amount,
  rentalId,
  onSuccess,
  onError,
}: PaymentGatewayProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const { t } = useTranslation();

  const handlePayment = async (provider: 'khalti' | 'esewa') => {
    try {
      setIsProcessing(true);
      
      // Create secure payment data
      const paymentData = {
        amount,
        orderId: rentalId,
        timestamp: new Date().toISOString()
      };

      // Check for fraud patterns
      if (!PaymentSecurity.detectFraudPatterns(paymentData)) {
        throw new Error('Suspicious payment activity detected');
      }

      // Encrypt payment data
      const encryptedData = await PaymentSecurity.encryptPaymentData(paymentData);
      
      const response = provider === 'khalti'
        ? await initiateKhaltiPayment(amount, rentalId)
        : await initiateEsewaPayment(amount, rentalId);

      if (response.success) {
        // Validate payment response
        const verification = await PaymentSecurity.validatePaymentResponse(response, paymentData);
        
        if (verification.isValid) {
          window.location.href = response.transactionId;
          onSuccess();
        } else {
          onError(verification.error || t('payment.validationFailed'));
        }
      } else {
        onError(response.message);
      }
    } catch (error) {
      onError(t('payment.initiationFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <LockClosedIcon className="h-4 w-4" />
          <span>{t('payment.secure')}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <ShieldCheckIcon className="h-4 w-4" />
          <span>{t('payment.encrypted')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handlePayment('khalti')}
          disabled={isProcessing}
          className="flex items-center justify-center space-x-2 p-4 border rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <img
            src="/images/khalti-logo.svg"
            alt="Khalti"
            className="h-8 w-8"
          />
          <div className="text-left">
            <p className="font-semibold">{t('payment.khalti')}</p>
            <p className="text-sm text-gray-600">{t('payment.khaltiDesc')}</p>
          </div>
        </button>

        <button
          onClick={() => handlePayment('esewa')}
          disabled={isProcessing}
          className="flex items-center justify-center space-x-2 p-4 border rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <img
            src="/images/esewa-logo.svg"
            alt="eSewa"
            className="h-8 w-8"
          />
          <div className="text-left">
            <p className="font-semibold">{t('payment.esewa')}</p>
            <p className="text-sm text-gray-600">{t('payment.esewaDesc')}</p>
          </div>
        </button>
      </div>

      {isProcessing && (
        <div className="text-center text-sm text-gray-600">
          <CreditCardIcon className="h-5 w-5 mx-auto mb-2 animate-pulse" />
          {t('payment.processing')}
        </div>
      )}
    </div>
  );
}