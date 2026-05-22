const express = require('express');
const { completeOnboardingController } = require('../controllers/userController')
const authRequired = require('../middleware/auth');

const router = express.Router()

router.post('/onboarding', authRequired, completeOnboardingController)

module.exports = router