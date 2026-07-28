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

  return res.status(200).json({
    hasCheckouts: typeof safepay.checkouts,
    hasCheckoutsPayment: safepay.checkouts ? typeof safepay.checkouts.payment : 'checkouts is undefined',
    packageVersion: require('@sfpy/node-core/package.json').version,
    availableTopLevelKeys: Object.keys(safepay)
  });
};
