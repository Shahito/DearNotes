const { getStats } = require('../services/statsService');

async function statsController(req, res) {
  try {
    const stats = await getStats(req.user.id);
    res.json(stats);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

module.exports = { statsController };
