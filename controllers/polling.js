const Polling = require('../models/Polling');
const asyncWrapper = require('../middlewares/asyncWrapper');
const { createCustomError } = require('../error/customApiError');
const SocietyInfo = require('../models/SocietyInfo');

const addPolling = asyncWrapper(async (req, res, next) => {
    const { pollingName, pollingEndDate, orgUniqueCode } = req.body;

    // Validate required input
    if (!pollingName || !pollingEndDate || !orgUniqueCode) {
        return next(createCustomError("Please provide all the required details", 400));
    }

    // Check if the organization exists
    const isUniqueCodeExist = await SocietyInfo.findOne({ orgUniqueCode });
    if (!isUniqueCodeExist) {
        return next(createCustomError("Unauthorized society", 400));
    }

    // Create a new polling
    const newPolling = new Polling({
        pollingName,
        pollingEndDate: new Date(pollingEndDate),
        orgUniqueCode
    });

    // Save the new polling to the database
    await newPolling.save();

    // Respond with success
    return res.status(201).json({ isSuccess: true, message: 'Polling added successfully', data: newPolling });
});

const deletePolling = asyncWrapper(async (req, res, next) => {
    const { pollingId, orgUniqueCode } = req.body;

    // Validate required input
    if (!pollingId || !orgUniqueCode) {
        return next(createCustomError("Please provide all the required details", 400));
    }

    try {
        // Find and delete the polling
        const polling = await Polling.findOneAndDelete({ _id: pollingId, orgUniqueCode });

        if (!polling) {
            return next(createCustomError("Polling not found or unauthorized action", 404));
        }

        // Respond with success
        return res.status(200).json({ isSuccess: true, message: 'Polling deleted successfully' });
    } catch (error) {
        return next(createCustomError("Error deleting polling", 500));
    }
});

const getPolling = asyncWrapper(async (req, res, next) => {
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
        query.pollingEndDate = {};
        if (fromDate) {
            query.pollingEndDate.$gte = new Date(fromDate);
        }
        if (toDate) {
            query.pollingEndDate.$lte = new Date(toDate);
        }
    }

    try {
        // Execute the query with pagination
        const polls = await Polling.find(query)
            .sort({ pollingEndDate: -1 }) // Sorting by pollingEndDate in descending order
            .skip(skip)
            .limit(limit);

        // Count the total number of records matching the query
        const totalPolls = await Polling.countDocuments(query);

        // Respond with the results
        return res.status(200).json({
            isSuccess: true,
            totalRecords: totalPolls,
            currentPage: page,
            totalPages: Math.ceil(totalPolls / limit),
            data: polls
        });
    } catch (error) {
        return next(createCustomError("Error fetching polls", 500));
    }
});

const updatePolling = asyncWrapper(async (req, res, next) => {
    const { pollingId, orgUniqueCode, voteYes, voteNo, votedMemberUserName } = req.body;

    // Validate required input
    if (!pollingId || !orgUniqueCode) {
        return next(createCustomError("Please provide all the required details", 400));
    }

    try {
        // Find the polling
        const polling = await Polling.findOne({ _id: pollingId, orgUniqueCode });

        if (!polling) {
            return next(createCustomError("Polling not found or unauthorized action", 404));
        }

        // Check if the user has already voted
        if (votedMemberUserName && polling.votedMemberUserName.includes(votedMemberUserName)) {
            return next(createCustomError("User already used his vote", 400));
        }

        // Update the polling with new votes and add the user to voted members
        if (voteYes !== undefined) {
            polling.voteYes = voteYes;
        }
        if (voteNo !== undefined) {
            polling.voteNo = voteNo;
        }
        if (votedMemberUserName) {
            polling.votedMemberUserName.push(votedMemberUserName);
        }

        await polling.save();

        // Respond with success
        return res.status(200).json({ isSuccess: true, message: 'Polling updated successfully', data: polling });
    } catch (error) {
        return next(createCustomError("Error updating polling", 500));
    }
});

module.exports = {
    addPolling,
    updatePolling,
    deletePolling,
    getPolling
}