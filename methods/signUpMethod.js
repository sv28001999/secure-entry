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

const compareOtp = async (password, hash) => {
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

async function example() {
    const password = 'password123';

    // Hash the password
    const hashedPassword = await hashPassword(password);
    console.log('Hashed password:', hashedPassword);

    // Verify the password against the hash
    const isValid = await compareOtp(password, hashedPassword);
    console.log('Password is valid:', isValid);
}

module.exports = { generateOtpAndMail, otpValidity, compareOtp }