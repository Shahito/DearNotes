const express = require('express');
const {
    registerController,
    loginController,
    meController,
    changePasswordController,
    logoutController
} = require('../controllers/authController');
const authRequired = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/change-password', authRequired, changePasswordController);
router.get('/me', authRequired, meController);
router.post('/logout', authRequired, logoutController);

module.exports = router;


