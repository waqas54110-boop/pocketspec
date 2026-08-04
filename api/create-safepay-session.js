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

  try {
    const sessionResponse = await safepay.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_API_KEY,
      intent: 'CYBERSOURCE',
      mode: 'payment',
      entry_mode: 'raw',
      currency: 'PKR',
      amount: 50000,
      metadata: { order_id: 'DEBUG' + Date.now() }
    });

    const authResponse = await safepay.client.passport.create();

    return res.status(200).json({
      fullSessionResponse: sessionResponse,
      fullAuthResponse: authResponse,
      trackerToken: sessionResponse.data.tracker.token,
      authTokenValue: authResponse.data,
      authTokenType: typeof authResponse.data
    });

  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
};
