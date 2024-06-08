const mongoose = require('mongoose')

const GateEntrySchema = new mongoose.Schema({
    personName: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    memberRoomNo: {
        type: String,
        required: true
    },
    work: {
        type: String,
        required: true
    },
    place: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    dateIn: {
        type: Date,
        default: Date.now
    },
    dateOut: {
        type: Date
    },
    isEntered: {
        type: Boolean,
        default: true
    },
    comment: {
        type: String,
        default: "NA"
    },
    orgUniqueCode: {
        type: String
    }
});

module.exports = mongoose.model("gateEntryRecords", GateEntrySchema);