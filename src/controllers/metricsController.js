const { parseBody, logUserLeft, logMemoryReveal } = require('../services/metricsService');

async function endSession(req, res) {
  const data = parseBody(req.body);
  await logUserLeft(data);
  res.sendStatus(204);
}

async function revealMemory(req, res) {
  await logMemoryReveal(req.body);
  res.sendStatus(204);
}

module.exports = { endSession, revealMemory };