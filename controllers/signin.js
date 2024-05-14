const Accounts = require('../models/Accounts');
const asyncWrapper = require('../middlewares/asyncWrapper');
const { createCustomError } = require('../error/customApiError');
const { compareHash, encryptPass } = require('../methods/signUpMethod');
const VerifyOTP = require('../models/VerifyOTP');
require('dotenv').config();

const login = asyncWrapper(async (req, res, next) => {
    const { username, password } = req.body;
    const existUsername = await Accounts.findOne({ $or: [{ email: username }, { username: username }] })
    if (!existUsername) {
        return next(createCustomError("Invalid credential", 400));
    }

    const isAuthenticate = await compareHash(password, existUsername.password);

    if (isAuthenticate) {
        return res.status(200).json({
            isSuccess: true,
            msg: 'Success',
            data: {
                email: existUsername.email,
                username: existUsername.username,
                isActive: existUsername.isActive
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
        return res.status(200).json({ isSuccess: true, msg: "Success" });
    }
    else {
        return next(createCustomError('Something went wrong', 400));
    }
});

module.exports = {
    login,
    updatePassword
}