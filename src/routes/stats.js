const express = require('express');
const router = express.Router();
const authRequired = require('../middleware/auth');
const { statsController } = require('../controllers/statsController');

router.get('/', authRequired, statsController);

module.exports = router;
