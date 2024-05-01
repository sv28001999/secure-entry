const Account = require('../models/SignUp');
const ValidateOtp = require('../models/VerifyOTP');
const AccountInfo = require('../models/AccountInfo');
const asyncWrapper = require('../middlewares/asyncWrapper');
const { createCustomError } = require('../error/customApiError');
const { generateOtpAndMail, otpValidity, compareOtp } = require('../methods/signUpMethod');

const sendOtp = asyncWrapper(async (req, res, next) => {
    const email = req.body.email;
    const isAccount = await ValidateOtp.findOne({ email: email });
    console.log(isAccount);
    if (!email) {
        return next(createCustomError("Email is required", 400));
    }
    else if (isAccount && +isAccount.otpRetryTime > Date.now()) {
        return next(createCustomError("Please try after sometime", 400));
    }
    else {
        const newOtp = await generateOtpAndMail(email);
        const newValidTime = await otpValidity();
        const createOtp = await ValidateOtp.findOneAndUpdate({ email: email },
            { otpValidity: newValidTime.validityTime, otpRetryTime: newValidTime.retryTime, otp: newOtp, email: email },
            { upsert: true, new: true });
        return res.status(200).json({
            isSuccess: true,
            data: { msg: "OTP sent successfully", validTill: createOtp.validDate }
        });
    }
});

const verifyOtp = asyncWrapper(async (req, res, next) => {
    const { email, otp } = req.body;
    const isAccount = await ValidateOtp.findOne({ email: email });
    if (!email) {
        return next(createCustomError("Email is required", 400));
    }
    else if (isAccount && +isAccount.otpValidity < Date.now()) {
        return next(createCustomError("OTP is expired", 400));
    }
    else {
        const isValidOtp = await compareOtp(otp, isAccount.otp);
        if (isAccount.otpValidity > Date.now() && isValidOtp) {
            return res.json({ isSuccess: true, msg: 'Otp verification successful' });
        }
        else {
            return res.json({ isSuccess: false, msg: 'Invalid OTP' });
        }
    }
});

const createAccount = asyncWrapper(async (req, res, next) => {

    const existingEmail = await AccountInfo.findOne({ email: req.body.email });
    if (existingEmail) {
        return next(createCustomError("Email already exists", 400));
    }

    const existingUsername = await AccountInfo.findOne({ username: req.body.username });
    if (existingUsername) {
        return next(createCustomError("Username already exists", 400));
    }
    
    const existingMob = await AccountInfo.findOne({ mobileNumber: req.body.mobileNumber });
    if (existingMob) {
        return next(createCustomError("Mobile number already exists", 400));
    }

    const newUser = new AccountInfo({
        email: req.body.email,
        username: req.body.username,
        accountRole: req.body.accountRole,
        societyAddress: req.body.societyAddress,
        mobileNumber: req.body.mobileNumber,
        password: req.body.password
    });

    await newUser.save();

    return res.status(200).json({ msg: 'Success' });
})

module.exports = {
    sendOtp,
    verifyOtp,
    createAccount
};