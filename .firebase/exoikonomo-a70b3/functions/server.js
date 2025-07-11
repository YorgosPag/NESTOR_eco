const { onRequest } = require('firebase-functions/v2/https');
  const server = import('firebase-frameworks');
  exports.ssrexoikonomoa70b3 = onRequest({"region":"us-central1"}, (req, res) => server.then(it => it.handle(req, res)));
  