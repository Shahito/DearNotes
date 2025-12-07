const express = require('express')
const router = express.Router()
const authRequired = require('../middleware/auth')
const { randomMemoryController } = require('../controllers/memoryController')

router.get('/random', authRequired, randomMemoryController)

module.exports = router