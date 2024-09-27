const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    noticeTitle: {
        type: String,
        required: true
    },
    noticeCreatedDate: {
        type: Date,
        default: Date.now
    },
    noticeImgUrl: {
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