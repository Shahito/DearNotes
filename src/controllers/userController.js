const { completeOnboarding } = require('../services/userService')

async function completeOnboardingController(req, res) {
  try {
    const { key } = req.body
    if (!key) return res.status(400).json({ error: 'MISSING_KEY' })

    await completeOnboarding(req.user.id, key)
    res.json({ success: true })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}

module.exports = { completeOnboardingController }