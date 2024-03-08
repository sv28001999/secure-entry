const express = require('express')
const router = express.Router()
const {
    sendOtp,
    verifyOtp
} = require('../controllers/signup')

router.route('/sendOtp').post(sendOtp)
router.route('/verifyOtp').post(verifyOtp)
router.route('/')

module.exports = router