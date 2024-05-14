const express = require('express');
const router = express.Router();
const {
    sendOtp,
    verifyOtp,
    createAccount,
    getSocietyInfo
} = require('../controllers/signup');

const {
    login,
    updatePassword
} = require('../controllers/signin');

router.route('/sendOtp').post(sendOtp);
router.route('/verifyOtp').post(verifyOtp);
router.route('/createAccount').post(createAccount);
router.route('/getSocietyInfo').post(getSocietyInfo);
router.route('/login').post(login);
router.route('/updatePassword').post(updatePassword);

module.exports = router;