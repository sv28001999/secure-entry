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
    password: {
        type: String,
        required: [true, 'Password must be required']
    },
    isActive: {
        type: Boolean
    }
})

module.exports = mongoose.model("Accounts", Accounts);