const mongoose = require('mongoose');

const otpValidationSchema = new mongoose.Schema({
    otp: {
        type: String,
        maxLength: 5,
        trim: true
    },
    otpValidity: {
        type: String,
        required: [true, 'Otp validity time is required']
    },
    otpRetryTime: {
        type: String,
        required: [true, 'Otp retry time is required']
    },
    updatePasswordTill: {
        type: String,
        default: Date.now * 60 * 1000
    },
    email: {
        type: String,
        required: [true, 'Email Validation Failed..']
    },
    isValidated: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('validateOtp', otpValidationSchema);