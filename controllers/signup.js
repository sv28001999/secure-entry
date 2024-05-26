const Accounts = require('../models/Accounts');
const ValidateOtp = require('../models/VerifyOTP');
const SocietyInfo = require('../models/SocietyInfo');
const AccountInfo = require('../models/AccountInfo');
const asyncWrapper = require('../middlewares/asyncWrapper');
const { createCustomError } = require('../error/customApiError');
const { generateOtpAndMail, otpValidity, compareHash, generateUniqueCode, encryptPass } = require('../methods/signUpMethod');
const VerifyOTP = require('../models/VerifyOTP');
require('dotenv').config()

const sendOtp = asyncWrapper(async (req, res, next) => {
    try {
        const email = req.body.email;
        if (!email) {
            return next(createCustomError("Email is required", 400));
        }

        const isRegisteredCustomer = await AccountInfo.findOne({ email: email });
        if (isRegisteredCustomer) {
            // Check if there is an existing OTP record for the email
            const existingOtpRecord = await ValidateOtp.findOne({ email: email });

            // Check if there's an existing OTP record and if the retry time has not elapsed
            if (existingOtpRecord && +existingOtpRecord.otpRetryTime > Date.now()) {
                return next(createCustomError("Please try after sometime", 400));
            }

            // Generate new OTP
            const newOtp = await generateOtpAndMail(email);

            // Calculate new validity and retry time for OTP
            const newValidTime = await otpValidity();

            // Update or create OTP record
            const createOtp = await ValidateOtp.findOneAndUpdate(
                { email: email },
                {
                    otpValidity: newValidTime.validityTime,
                    otpRetryTime: newValidTime.retryTime,
                    otp: newOtp,
                    email: email
                },
                { upsert: true, new: true }
            );

            return res.status(200).json({
                isSuccess: true,
                data: { msg: "OTP sent successfully", validTill: createOtp.validDate }
            });
        }
        else {
            return next(createCustomError("Email not registered", 400));
        }

    } catch (error) {
        console.log(error);
        return next(createCustomError("Internal server error", 500));
    }
});

const verifyOtp = asyncWrapper(async (req, res, next) => {
    try {
        const { email, otp, changePasswordFlag } = req.body;

        if (!email) {
            return next(createCustomError("Email is required", 400));
        }

        // Check if there is an existing OTP record for the email
        const existingOtpRecord = await ValidateOtp.findOne({ email: email });

        // Check if the email exists in the OTP records
        if (!existingOtpRecord) {
            return res.json({ isSuccess: false, msg: 'No OTP found for this email' });
        }

        // Check if OTP has expired
        if (+existingOtpRecord.otpValidity < Date.now()) {
            return next(createCustomError("OTP is expired", 400));
        }

        // Verify OTP
        const isValidOtp = await compareHash(otp, existingOtpRecord.otp);

        if (isValidOtp && !changePasswordFlag) {
            await AccountInfo.findOneAndUpdate(
                { email: email },
                {
                    isActive: true
                },
                { upsert: true, new: true }
            );
            await Accounts.findOneAndUpdate(
                { email: email },
                {
                    isActive: true
                },
                { upsert: true, new: true }
            );
            return res.status(200).json({ isSuccess: true, msg: 'OTP verification successful' });
        }
        else if (isValidOtp && changePasswordFlag) {
            const changePassDate = Date.now() + 5 * 60 * 1000;
            await VerifyOTP.findOneAndUpdate(
                { email: email },
                {
                    updatePasswordTill: changePassDate,
                    isValidated: true
                },
                { upsert: true, new: true }
            )
            return res.status(200).json({ isSuccess: true, msg: 'OTP verification successful' });
        } else {
            return res.json({ isSuccess: false, msg: 'Invalid OTP' });
        }
    } catch (error) {
        console.log(error);
        return next(createCustomError("Internal server error", 500));
    }
});

const createAccount = asyncWrapper(async (req, res, next) => {
    const { email, username, orgUniqueCode, accountRole, societyAddress, fullName, mobileNumber, password } = req.body;

    // Check if email or username already exists
    const existingAccount = await AccountInfo.findOne({ $or: [{ email }, { username }] });
    if (existingAccount) {
        return next(createCustomError("Email or username already exists", 400));
    }

    // Check account role and organization unique code
    if ((orgUniqueCode && accountRole === "SC") || (!orgUniqueCode && accountRole !== "SC")) {
        return next(createCustomError("Invalid request", 400));
    }

    // Check organization unique code if provided
    if (orgUniqueCode && accountRole !== "SC") {
        const isUniqueCodeExists = await SocietyInfo.findOne({ orgUniqueCode });
        if (!isUniqueCodeExists) {
            return next(createCustomError("Invalid unique code", 400));
        }
    }

    // Generate organization unique code if not provided
    const generatedOrgUniqueCode = orgUniqueCode || await generateUniqueCode(username, societyAddress.societyName, process.env.SE_ORG_UNIQUE_KEY);
    const hashedPassword = await encryptPass(password);

    // Create new user account
    const newUser = new AccountInfo({
        fullName,
        email,
        username,
        accountRole,
        societyAddress,
        mobileNumber,
        password: hashedPassword,
        orgUniqueCode: generatedOrgUniqueCode
    });

    await newUser.save();

    await new Accounts({
        email: email,
        username: username,
        password: hashedPassword,
        roleType: accountRole,
        isActive: false
    }).save();

    if (!orgUniqueCode && accountRole === "SC") {
        await new SocietyInfo({
            orgUniqueCode: generatedOrgUniqueCode,
            fullName: fullName,
            societyAddress
        }).save();
    }

    return res.status(200).json({
        isSuccess: true,
        msg: 'Success',
        data: {
            fullName: fullName,
            email: email,
            username: username,
            mobileNumber: mobileNumber,
            societyAddress: societyAddress,
            orgUniqueCode: generatedOrgUniqueCode,
            roleType: accountRole
        }
    });
});

const getSocietyInfo = asyncWrapper(async (req, res, next) => {
    if (req.body.orgUniqueCode) {
        const existUniqueData = await SocietyInfo.findOne({ orgUniqueCode: req.body.orgUniqueCode });
        if (!existUniqueData) {
            return next(createCustomError("Invalid unique code", 400));
        }
        else {
            return res.status(200).json({
                isSuccess: true,
                msg: 'Success',
                data: {
                    fullName: existUniqueData.fullName,
                    societyAddress: existUniqueData.societyAddress
                }
            })
        }
    }
    return next(createCustomError("Society unique code is required", 400));
});

module.exports = {
    sendOtp,
    verifyOtp,
    createAccount,
    getSocietyInfo
};