const jwt = require('jsonwebtoken');
const {createCustomError} = require('../error/customApiError');
const Token = require('../models/Token');
require('dotenv').config();

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(createCustomError('Access denied. No token provided.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const tokenExists = await Token.findOne({ token });

        if (!tokenExists) {
            return next(createCustomError('Invalid token.', 403));
        }

        req.user = decoded;
        next();
    } catch (err) {
        return next(createCustomError('Invalid token 1', 403));
    }
};

module.exports = verifyToken;
