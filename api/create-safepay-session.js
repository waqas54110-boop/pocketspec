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

  // Debug: inspect available methods
  console.log('safepay keys:', Object.keys(safepay));
  console.log('safepay.auth:', safepay.auth);
  console.log('safepay.checkouts:', safepay.checkouts);

  return res.status(200).json({
    keys: Object.keys(safepay),
    hasAuth: !!safepay.auth,
    hasCheckouts: !!safepay.checkouts,
    authKeys: safepay.auth ? Object.keys(safepay.auth) : null,
    checkoutsKeys: safepay.checkouts ? Object.keys(safepay.checkouts) : null
  });
};
