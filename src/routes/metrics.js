const express = require('express')
const router = express.Router()
const { endSession, revealMemory } = require('../controllers/metricsController');

router.post('/end', express.raw({ type: '*/*' }), endSession);
router.post('/reveal', revealMemory);

module.exports = router;