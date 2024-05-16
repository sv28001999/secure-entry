const mongoose = require('mongoose');

const SocietyInfo = new mongoose.Schema({
    orgUniqueCode: {
        type: String,
        required: [true, "Society unique code is required"]
    },
    fullName: {
        type: String,
        required: [true, 'Full Name is required']
    },
    societyAddress: {
        state: String,
        city: String,
        street: String,
        societyName: String,
        pinCode: Number
    }
});

module.exports = mongoose.model("SocietyInfo", SocietyInfo);