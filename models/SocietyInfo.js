const mongoose = require('mongoose');

const SocietyInfo = new mongoose.Schema({
    orgUniqueCode: {
        type: String,
        required: [true, "Society unique code is required"]
    },
    firstName: {
        type: String,
        required: [true, 'First Name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last Name is required']
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