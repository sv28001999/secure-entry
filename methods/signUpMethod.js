const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
require('dotenv').config();

const generateOtpAndMail = async (emailId) => {
    const genOtp = Math.floor(1000 + Math.random() * 9000);
    await sendMail(genOtp, emailId);
    const hashedOtp = await hashPassword(genOtp.toString())
    return hashedOtp;
}

const otpValidity = async () => {
    const nextRetryTime = Date.now() + 2 * 60 * 1000;
    const nextValidityTime = Date.now() + 5 * 60 * 1000;
    return { retryTime: nextRetryTime, validityTime: nextValidityTime };
}

const hashPassword = async (password) => {
    try {
        const saltRounds = 10; // Recommended number of salt rounds
        const salt = await bcrypt.genSalt(saltRounds);

        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (error) {
        console.error('Error occurred while hashing password:', error);
        throw error;
    }
}

const compareHash = async (password, hash) => {
    try {
        const result = await bcrypt.compare(password, hash);
        return result;
    } catch (error) {
        console.error('Error occurred while verifying password:', error);
        throw error;
    }
}

const sendMail = async (otp, emailId) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'shivam033vishwakarma@gmail.com',
            pass: process.env.EMAIL_KEY
        }
    });

    let mailOptions = {
        from: 'shivam033vishwakarma@gmail.com',
        to: emailId,
        subject: 'Account Verification!',
        text: `Hi,\nVerify your account using ${otp} otp. This otp is valid for 5 min only\n\nThanks`
    };

    return transporter.sendMail(mailOptions)
}

async function generateUniqueCode(string1, string2, string3) {
    const timestamp = Date.now().toString(36); // Convert current timestamp to base36 string
    const random = Math.random().toString(36).substring(2, 5); // Generate a random base36 string

    // Concatenate the three strings and append timestamp and random string
    const uniqueCode = string1.substring(0, 2) +
        string2.substring(0, 3) +
        string3.substring(0, 3) +
        timestamp +
        random;

    return uniqueCode.toUpperCase(); // Convert the code to uppercase for consistency
}

async function encryptPass(password) {
    const hashedPassword = await hashPassword(password);
    return hashedPassword;
}

module.exports = { generateOtpAndMail, otpValidity, compareHash, generateUniqueCode, encryptPass }