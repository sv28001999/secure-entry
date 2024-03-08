const mongoose = require('mongoose')

const SignUp = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: [true, 'Name must be required']
    },
    password: {
        type: String,
        required: [true, 'Password must be required']
    }
})

module.exports = mongoose.model('Account', SignUp)