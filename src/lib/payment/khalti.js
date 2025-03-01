import axios from 'axios';

const KHALTI_API_URL = process.env.NEXT_PUBLIC_KHALTI_API_URL || 'https://khalti.com/api/v2';
const KHALTI_PUBLIC_KEY = process.env.NEXT_PUBLIC_KHALTI_PUBLIC_KEY;
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

export const initiateKhaltiPayment = async ({
  amount,
  productIdentity,
  productName,
  customerInfo,
  paymentPreference = ['KHALTI'],
}) => {
  try {
    const response = await axios.post(
      `${KHALTI_API_URL}/payment/initiate/`,
      {
        return_url: `${window.location.origin}/payment/verify`,
        website_url: window.location.origin,
        amount: amount * 100, // Convert to paisa
        purchase_order_id: productIdentity,
        purchase_order_name: productName,
        customer_info: customerInfo,
        payment_preference: paymentPreference,
      },
      {
        headers: {
          Authorization: `Key ${KHALTI_PUBLIC_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error initiating Khalti payment:', error);
    throw error;
  }
};

export const verifyKhaltiPayment = async (token, amount) => {
  try {
    const response = await axios.post(
      `${KHALTI_API_URL}/payment/verify/`,
      {
        token,
        amount,
      },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error verifying Khalti payment:', error);
    throw error;
  }
};
