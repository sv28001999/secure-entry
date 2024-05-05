const mongoose = require('mongoose');

const AccountInfo = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First Name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last Name is required']
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
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    isActive: {
        type: Boolean,
        default: false
    },
    orgUniqueCode: {
        type: String,
        required: [true, "Society unique code is required"]
    }
});

module.exports = mongoose.model("AccountInfo", AccountInfo);