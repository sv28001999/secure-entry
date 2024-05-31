const Accounts = require('../models/Accounts');
const Token = require('../models/Token');
const jwt = require('jsonwebtoken');
const asyncWrapper = require('../middlewares/asyncWrapper');
const { createCustomError } = require('../error/customApiError');
const { compareHash, encryptPass } = require('../methods/signUpMethod');
const VerifyOTP = require('../models/VerifyOTP');
const AccountInfo = require('../models/AccountInfo');
require('dotenv').config();

const login = asyncWrapper(async (req, res, next) => {
    const { username, password } = req.body;
    const existUsername = await Accounts.findOne({ $or: [{ email: username }, { username: username }] })
    if (!existUsername) {
        return next(createCustomError("Invalid credential", 400));
    }

    const isAuthenticate = await compareHash(password, existUsername.password);

    if (isAuthenticate) {
        // Generate JWT token
        const token = jwt.sign(
            {
                email: existUsername.email,
                username: existUsername.username,
                roleType: existUsername.roleType,
                isActive: existUsername.isActive
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '30d' }
        );

        // Save token in database
        // const newToken = new Token({ userId: existUsername._id, token });
        // await newToken.save();

        await Token.findOneAndUpdate(
            { userId: existUsername._id },
            {
                token: token
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            isSuccess: true,
            msg: 'Success',
            data: {
                email: existUsername.email,
                username: existUsername.username,
                roleType: existUsername.roleType,
                isActive: existUsername.isActive,
                token: token
            }
        });
    }
    else {
        return next(createCustomError("Invalid credential", 400));
    }
});

const updatePassword = asyncWrapper(async (req, res, next) => {
    console.log("update password");
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
        return next(createCustomError('Invalid Details', 400));
    }
    const user = await VerifyOTP.findOne({ email: email });
    if (!user) {
        return next(createCustomError('Invalid User', 400));
    }
    if (user && user.isValidated && user.updatePasswordTill > Date.now()) {
        const hashedPassword = await encryptPass(password);
        await Accounts.findOneAndUpdate(
            { email: email },
            {
                password: hashedPassword
            },
            { upsert: true, new: true }
        );
        await VerifyOTP.findOneAndUpdate(
            { email: email },
            {
                updatePasswordTill: Date.now()
            },
            { upsert: true, new: true }
        )
        return res.status(200).json({ isSuccess: true, msg: "Success" });
    }
    else {
        return next(createCustomError('Something went wrong', 400));
    }
});

const getMemberList = asyncWrapper(async (req, res, next) => {
    const { orgUniqueCode, accountRole } = req.body;

    if (!orgUniqueCode) {
        return next(createCustomError("Please provide society unique code", 400));
    }

    const isUniqueCodeExist = await SocietyInfo.findOne({ orgUniqueCode });
    if (!isUniqueCodeExist) {
        return next(createCustomError("Unauthorized society", 400));
    }

    try {
        let query = { orgUniqueCode };
        if (accountRole) {
            query.roleType = accountRole;
        }

        const members = await AccountInfo.find(query);

        return res.status(200).json({
            isSuccess: true,
            data: members
        });
    } catch (error) {
        return next(createCustomError("Error fetching member list", 500));
    }
});

const getMemberVerifyStatus = asyncWrapper(async (req, res, next) => {
    const { orgUniqueCode, memberId } = req.body;

    // Validate required input
    if (!orgUniqueCode || !memberId) {
        return next(createCustomError("Please provide all the required details", 400));
    }

    // Check if the organization exists
    const isUniqueCodeExist = await SocietyInfo.findOne({ orgUniqueCode });
    if (!isUniqueCodeExist) {
        return next(createCustomError("Unauthorized society", 400));
    }

    try {
        // Find the member by orgUniqueCode and memberId
        const member = await AccountInfo.findOne({ _id: memberId, orgUniqueCode });

        if (!member) {
            return next(createCustomError("Member not found or unauthorized action", 404));
        }

        // Respond with the member's verification status
        return res.status(200).json({
            isSuccess: true,
            data: {
                memberId: member._id,
                isVerified: member.isVerified
            }
        });
    } catch (error) {
        return next(createCustomError("Error fetching member verification status", 500));
    }
});

const verifyMember = asyncWrapper(async (req, res, next) => {
    const { orgUniqueCode, memberId } = req.body;

    if (!orgUniqueCode || !memberId) {
        return next(createCustomError("Please provide all the required details", 400));
    }

    const isUniqueCodeExist = await SocietyInfo.findOne({ orgUniqueCode });
    if (!isUniqueCodeExist) {
        return next(createCustomError("Unauthorized society", 400));
    }

    try {
        const member = await AccountInfo.findOneAndUpdate(
            { _id: memberId, orgUniqueCode },
            { isVerified: true },
            { new: true }
        );

        if (!member) {
            return next(createCustomError("Member not found or unauthorized action", 404));
        }

        return res.status(200).json({
            isSuccess: true,
            message: 'Member verified successfully',
            data: member
        });
    } catch (error) {
        return next(createCustomError("Error verifying member", 500));
    }
});

module.exports = {
    login,
    updatePassword,
    getMemberList,
    verifyMember,
    getMemberVerifyStatus
}