const { parseBody, logUserLeft } = require('../services/metricsService');

async function endSession(req, res) {
  const data = parseBody(req.body);
  await logUserLeft(data);
  res.sendStatus(204);
}

module.exports = { endSession };