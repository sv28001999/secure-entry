const express = require('express');
const router = express.Router();
const {
    sendOtp,
    verifyOtp,
    createAccount
} = require('../controllers/signup');

router.route('/sendOtp').post(sendOtp);
router.route('/verifyOtp').post(verifyOtp);
router.route('/createAccount').post(createAccount);

module.exports = router;