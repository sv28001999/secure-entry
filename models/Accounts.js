const mongoose = require('mongoose')

const Accounts = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: [true, 'Email must be required']
    },
    username: {
        type: String,
        trim: true,
        required: [true, 'Username must be required']
    },

    orgUniqueCode: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Password must be required']
    },
    roleType: {
        type: String,
        require: [true, 'Role must be required'],
        enum: {
            values: ['SC', 'SM', 'SG'],
            message: 'Invalid account role'
        },
    },
    isActive: {
        type: Boolean
    }
})

module.exports = mongoose.model("Accounts", Accounts);