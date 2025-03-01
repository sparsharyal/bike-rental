import axios from 'axios';

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_API_URL = 'https://khalti.com/api/v2/payment/verify/';

export async function verifyKhaltiPayment(payload) {
  try {
    const { token, amount } = payload;
    
    const response = await axios.post(
      KHALTI_API_URL,
      {
        token,
        amount
      },
      {
        headers: {
          'Authorization': `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.state && response.data.state.name === 'Completed') {
      return {
        success: true,
        data: response.data,
        message: 'Payment verified successfully'
      };
    } else {
      return {
        success: false,
        data: response.data,
        message: 'Payment verification failed'
      };
    }
  } catch (error) {
    console.error('Khalti payment verification error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Payment verification failed');
  }
}
