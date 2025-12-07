const express = require('express')
const router = express.Router()
const authRequired = require('../middleware/auth')
const { createCoupleController, joinCoupleController, getCoupleCodeController } = require('../controllers/coupleController')

router.post('/create', authRequired, createCoupleController)
router.post('/join', authRequired, joinCoupleController)
router.get('/code', authRequired, getCoupleCodeController)

module.exports = router
