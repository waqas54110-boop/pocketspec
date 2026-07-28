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
    return res.status(200).json({
      hasCheckouts: typeof safepay.checkouts,
      checkoutsKeys: safepay.checkouts ? Object.keys(safepay.checkouts) : 'checkouts is undefined',
      hasCheckout: typeof safepay.checkout,
      checkoutKeys: safepay.checkout ? Object.keys(safepay.checkout) : 'checkout is undefined',
      availableTopLevelKeys: Object.keys(safepay)
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
