const Safepay = require('@sfpy/node-core');

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: 'secret',
  host: 'https://sandbox.api.getsafepay.com'
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, customerName } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  const orderId = 'ORD' + Date.now();

  try {
    const response = await safepay.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_API_KEY,
      intent: 'CYBERSOURCE',
      mode: 'payment',
      currency: 'PKR',
      amount: Math.round(amount * 100),
      metadata: { order_id: orderId }
    });

    const token = response.data.tracker.token;

    res.status(200).json({ token, orderId });

  } catch (err) {
    console.error('SAFEPAY ERROR:', err);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
};
