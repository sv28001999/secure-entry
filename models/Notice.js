const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    noticeTitle: {
        type: String,
        required: true
    },
    noticeDate: {
        type: Date,
        default: Date.now
    },
    image: {
        type: String
    },
    noticeContent: {
        type: String,
        required: true
    },
    orgUniqueCode: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Notice', NoticeSchema);