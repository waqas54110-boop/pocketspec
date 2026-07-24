const Safepay = require('@sfpy/node-core');

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: 'secret',
  host: 'https://sandbox.api.getsafepay.com'
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  return res.status(200).json({
    checkoutKeys: safepay.checkout ? Object.keys(safepay.checkout) : null,
    clientKeys: safepay.client ? Object.keys(safepay.client) : null,
    paymentsKeys: safepay.payments ? Object.keys(safepay.payments) : null
  });
};
