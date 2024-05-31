const mongoose = require('mongoose');

const PollingSchema = new mongoose.Schema({
    pollingName: {
        type: String,
        required: true
    },
    pollingEndDate: {
        type: Date,
        required: true
    },
    voteYes: {
        type: Number,
        default: 0
    },
    voteNo: {
        type: Number,
        default: 0
    },
    votedMemberUserName: {
        type: [String],
        default: []
    },
    orgUniqueCode: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Polling', PollingSchema);
