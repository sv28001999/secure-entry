const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    eventTitle: {
        type: String,
        required: true
    },
    eventStartDate: {
        type: Date,
        required: true
    },
    eventEndDate: {
        type: Date,
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
