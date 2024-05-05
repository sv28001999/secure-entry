const Accounts = require('../models/Accounts');
const asyncWrapper = require('../middlewares/asyncWrapper');
const { createCustomError } = require('../error/customApiError');
const { compareHash } = require('../methods/signUpMethod');
require('dotenv').config()

const login = asyncWrapper(async (req, res, next) => {
    const { username, password } = req.body;
    const existUsername = await Accounts.findOne({ $or: [{ email: username }, { username: username }] })
    if (!existUsername) {
        return next(createCustomError("Invalid credential", 400));
    }

    const isAuthenticate =await compareHash(password, existUsername.password);

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
})

module.exports = {
    login
}