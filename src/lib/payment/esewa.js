import axios from 'axios';

const ESEWA_API_URL = process.env.NEXT_PUBLIC_ESEWA_API_URL || 'https://uat.esewa.com.np';
const ESEWA_MERCHANT_ID = process.env.NEXT_PUBLIC_ESEWA_MERCHANT_ID;
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;

export const initiateEsewaPayment = ({
  amount,
  productId,
  productName,
  successUrl,
  failureUrl,
}) => {
  const form = document.createElement('form');
  form.setAttribute('method', 'POST');
  form.setAttribute('action', `${ESEWA_API_URL}/epay/main`);

  const params = {
    amt: amount,
    psc: 0,
    pdc: 0,
    txAmt: 0,
    tAmt: amount,
    pid: productId,
    scd: ESEWA_MERCHANT_ID,
    su: successUrl,
    fu: failureUrl,
  };

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
};

export const verifyEsewaPayment = async (params) => {
  try {
    const { oid, amt, refId } = params;
    const response = await axios.get(
      `${ESEWA_API_URL}/epay/transrec`,
      {
        params: {
          amt,
          rid: refId,
          pid: oid,
          scd: ESEWA_MERCHANT_ID,
        },
        headers: {
          Authorization: `Key ${ESEWA_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error verifying eSewa payment:', error);
    throw error;
  }
};
