const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    eventTitle: {
        type: String,
        required: true
    },
    eventStartDate: {
        type: String,
        required: true
    },
    eventEndDate: {
        type: String,
        required: true
    },
    eventCreatedDate: {
        type: Date,
        default: Date.now
    },
    eventContent: {
        type: String,
        required: true
    },
    orgUniqueCode: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Event', EventSchema);
