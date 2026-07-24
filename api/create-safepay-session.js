const Safepay = require('@sfpy/node-core');

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: 'secret',
  host: 'https://sandbox.api.getsafepay.com'
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, customerName } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  const orderId = 'ORD' + Date.now();

  try {
    // Step 1: Create payment session (tracker)
    const sessionResponse = await safepay.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_API_KEY,
      intent: 'CYBERSOURCE',
      mode: 'payment',
      entry_mode: 'raw',
      currency: 'PKR',
      amount: Math.round(amount * 100),
      metadata: { order_id: orderId }
    });

    console.log('SESSION RESPONSE:', JSON.stringify(sessionResponse));
    const trackerToken = sessionResponse.data.tracker.token;

    // Step 2: Create authentication token
    const authResponse = await safepay.client.passport.create();
    console.log('AUTH RESPONSE:', JSON.stringify(authResponse));
    const authToken = authResponse.data;

    // Step 3: Generate the Checkout URL
    const checkoutUrl = await safepay.checkout.createCheckoutUrl({
      tracker: trackerToken,
      tbt: authToken,
      environment: 'sandbox',
      source: 'hosted',
      redirect_url: 'https://pocketspec.vercel.app/order-success',
      cancel_url: 'https://pocketspec.vercel.app/order-cancel'
    });

    console.log('CHECKOUT URL:', checkoutUrl);

    res.status(200).json({ checkoutUrl, orderId });

  } catch (err) {
    console.error('SAFEPAY ERROR:', err);
    res.status(500).json({ error: 'Payment session creation failed', details: err.message });
  }
};
