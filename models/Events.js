const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    eventTitle: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true
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
