const express = require('express')
const router = express.Router()
const { endSession } = require('../controllers/metricsController');

router.post('/end', express.raw({ type: '*/*' }), endSession);

module.exports = router;