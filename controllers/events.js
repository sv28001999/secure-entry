const Events = require('../models/Events');
const asyncWrapper = require('../middlewares/asyncWrapper');
const { createCustomError } = require('../error/customApiError');
const SocietyInfo = require('../models/SocietyInfo');

const addEvent = asyncWrapper(async (req, res, next) => {
    const { eventTitle, eventStartDate, eventEndDate, eventContent, orgUniqueCode } = req.body;

    // Validate required input
    if (!eventTitle || !eventStartDate || !eventEndDate || !eventContent || !orgUniqueCode) {
        return next(createCustomError("Please provide all the required details", 400));
    }

    // Check if the organization exists
    const isUniqueCodeExist = await SocietyInfo.findOne({ orgUniqueCode });
    if (!isUniqueCodeExist) {
        return next(createCustomError("Unauthorized society", 400));
    }

    // Create a new event
    const newEvent = new Events({
        eventTitle,
        eventStartDate,
        eventEndDate,
        eventContent,
        orgUniqueCode
    });

    // Save the new event to the database
    await newEvent.save();

    // Respond with success
    return res.status(201).json({ isSuccess: true, message: 'Event added successfully', data: newEvent });
});

const deleteEvent = asyncWrapper(async (req, res, next) => {
    const { eventId, orgUniqueCode } = req.body;

    // Validate required input
    if (!eventId || !orgUniqueCode) {
        return next(createCustomError("Please provide all the required details", 400));
    }

    try {
        // Find and delete the event
        const event = await Event.findOneAndDelete({ _id: eventId, orgUniqueCode });

        if (!event) {
            return next(createCustomError("Event not found or unauthorized action", 404));
        }

        // Respond with success
        return res.status(200).json({ isSuccess: true, message: 'Event deleted successfully' });
    } catch (error) {
        return next(createCustomError("Error deleting event", 500));
    }
});

const getEvent = asyncWrapper(async (req, res, next) => {
    const { orgUniqueCode, fromDate, toDate, page = 1 } = req.body;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Validate required input
    if (!orgUniqueCode) {
        return next(createCustomError("Please provide the organization unique code", 400));
    }

    // Build the query object
    let query = { orgUniqueCode };

    if (fromDate || toDate) {
        query.eventCreatedDate = {};
        if (fromDate) {
            query.eventCreatedDate.$gte = new Date(fromDate);
        }
        if (toDate) {
            query.eventCreatedDate.$lte = new Date(toDate);
        }
    }

    try {
        // Execute the query with pagination
        const events = await Events.find(query)
            .sort({ eventCreatedDate: -1 }) // Sorting by eventDate in descending order
            .skip(skip)
            .limit(limit);

        // Count the total number of records matching the query
        const totalEvents = await Events.countDocuments(query);

        // Respond with the results
        return res.status(200).json({
            isSuccess: true,
            totalRecords: totalEvents,
            currentPage: page,
            totalPages: Math.ceil(totalEvents / limit),
            data: events
        });
    } catch (error) {
        return next(createCustomError("Error fetching events", 500));
    }
});

module.exports = {
    addEvent,
    deleteEvent,
    getEvent
}