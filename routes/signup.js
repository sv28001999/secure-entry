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
    updatePassword,
    getMemberList,
    verifyMember,
    getMemberVerifyStatus
} = require('../controllers/signin');

const {
    addNotice,
    getNotice,
    deleteNotice
} = require('../controllers/notice');

const {
    addEvent,
    deleteEvent,
    getEvent
} = require('../controllers/events');

const {
    addPolling,
    updatePolling,
    deletePolling,
    getPolling
} = require('../controllers/polling');

const { uploadEntry, updateEntry, getEntryDetails } = require('../controllers/dataEntry');
const verifyToken = require('../middlewares/verifyToken');

router.route('/sendOtp').post(sendOtp);
router.route('/verifyOtp').post(verifyOtp);
router.route('/createAccount').post(createAccount);
router.route('/getSocietyInfo').post(getSocietyInfo);
router.route('/login').post(login);
router.route('/updatePassword').post(updatePassword);
router.route('/uploadEntry').post(verifyToken, uploadEntry);
router.route('/updateEntry').post(verifyToken, updateEntry);
router.route('/getEntryDetails').post(verifyToken, getEntryDetails);
router.route('/addNotice').post(verifyToken, addNotice);
router.route('/getNotice').post(verifyToken, getNotice);
router.route('/deleteNotice').post(verifyToken, deleteNotice);
router.route('/addEvent').post(verifyToken, addEvent);
router.route('/deleteEvent').post(verifyToken, deleteEvent);
router.route('/getEvent').post(verifyToken, getEvent);
router.route('/addPolling').post(verifyToken, addPolling);
router.route('/deletePolling').post(verifyToken, deletePolling);
router.route('/updatePolling').post(verifyToken, updatePolling);
router.route('/getPolling').post(verifyToken, getPolling);
router.route('/getMemberList').post(verifyToken, getMemberList);
router.route('/verifyMember').post(verifyToken, verifyMember);
router.route('/getMemberVerifyStatus').post(verifyToken, getMemberVerifyStatus);

module.exports = router;