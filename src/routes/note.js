const express = require('express')
const router = express.Router()
const authRequired = require('../middleware/auth')
const { addNoteController, getNotesController } = require('../controllers/noteController')

router.post('/add', authRequired, addNoteController)
router.get('/list', authRequired, getNotesController)

module.exports = router
