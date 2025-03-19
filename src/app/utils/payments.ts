import axios from 'axios';

interface PaymentConfig {
  merchantId: string;
  secretKey: string;
  returnUrl: string;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  amount?: number;
}

const KHALTI_CONFIG: PaymentConfig = {
  merchantId: process.env.KHALTI_MERCHANT_ID || '',
  secretKey: process.env.KHALTI_SECRET_KEY || '',
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/customer-dashboard/payments/verify`
};

const ESEWA_CONFIG: PaymentConfig = {
  merchantId: process.env.ESEWA_MERCHANT_ID || '',
  secretKey: process.env.ESEWA_SECRET_KEY || '',
  returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/customer-dashboard/payments/verify`
};

export async function initiateKhaltiPayment(amount: number, orderId: string): Promise<PaymentResponse> {
  try {
    const response = await axios.post('https://khalti.com/api/v2/payment/initiate/', {
      return_url: KHALTI_CONFIG.returnUrl,
      website_url: process.env.NEXT_PUBLIC_APP_URL,
      amount: amount * 100, // Convert to paisa
      purchase_order_id: orderId,
      merchant_id: KHALTI_CONFIG.merchantId
    }, {
      headers: {
        'Authorization': `Key ${KHALTI_CONFIG.secretKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      message: 'Payment initiated successfully',
      transactionId: response.data.payment_url
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to initiate payment'
    };
  }
}

export async function initiateEsewaPayment(amount: number, orderId: string): Promise<PaymentResponse> {
  try {
    const params = {
      amt: amount,
      psc: 0,
      pdc: 0,
      txAmt: 0,
      tAmt: amount,
      pid: orderId,
      scd: ESEWA_CONFIG.merchantId,
      su: ESEWA_CONFIG.returnUrl,
      fu: `${process.env.NEXT_PUBLIC_APP_URL}/customer-dashboard/payments/failed`
    };

    const form = document.createElement('form');
    form.setAttribute('method', 'POST');
    form.setAttribute('action', 'https://esewa.com.np/epay/main');

    for (const key in params) {
      const hiddenField = document.createElement('input');
      hiddenField.setAttribute('type', 'hidden');
      hiddenField.setAttribute('name', key);
      hiddenField.setAttribute('value', params[key]);
      form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    return {
      success: true,
      message: 'Payment initiated successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to initiate payment'
    };
  }
}

export async function verifyPayment(token: string, provider: 'khalti' | 'esewa'): Promise<PaymentResponse> {
  try {
    if (provider === 'khalti') {
      const response = await axios.post('https://khalti.com/api/v2/payment/verify/', {
        token: token
      }, {
        headers: {
          'Authorization': `Key ${KHALTI_CONFIG.secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        message: 'Payment verified successfully',
        transactionId: response.data.idx,
        amount: response.data.amount / 100 // Convert from paisa to rupees
      };
    } else {
      // eSewa verification
      const response = await axios.get(`https://esewa.com.np/epay/transrec?rid=${token}&scd=${ESEWA_CONFIG.merchantId}`);
      
      return {
        success: response.data.includes('Success'),
        message: response.data.includes('Success') ? 'Payment verified successfully' : 'Payment verification failed',
        transactionId: token
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to verify payment'
    };
  }
}