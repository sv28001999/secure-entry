const mongoose = require('mongoose');

const AccountInfo = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Account is already exist']
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true
    },
    accountRole: {
        type: String,
        enum: {
            values: ['SC', 'SM', 'SG'],
            message: 'Invalid account role'
        },
        required: [true, 'Account role is required']
    },
    societyAddress: {
        state: String,
        city: String,
        street: String,
        societyName: String,
        pinCode: Number
    },
    dateOfRegistration: {
        type: Date,
        default: Date.now
    },
    mobileNumber: {
        type: String,
        required: [true, 'Mobile number is required']
    },
    isActive: {
        type: Boolean,
        default: false
    },
    orgUniqueCode: {
        type: String,
        required: [true, "Society unique code is required"]
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("AccountInfo", AccountInfo);