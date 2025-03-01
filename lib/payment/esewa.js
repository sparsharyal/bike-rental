import axios from 'axios';

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;
const ESEWA_API_URL = process.env.ESEWA_API_URL;

export async function verifyEsewaPayment(payload) {
  try {
    const response = await axios.post(
      ESEWA_API_URL,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${ESEWA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('eSewa payment verification error:', error);
    throw new Error('Payment verification failed');
  }
}
