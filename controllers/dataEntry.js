const asyncWrapper = require('../middlewares/asyncWrapper');
const { createCustomError } = require('../error/customApiError');
const GateEntry = require('../models/GateEntry');
const SocietyInfo = require('../models/SocietyInfo');

const uploadEntry = asyncWrapper(async (req, res, next) => {
    const { personName, mobileNumber, work, place, imageUrl, orgUniqueCode } = req.body;
    const isUniqueCodeExist = await SocietyInfo.findOne({ orgUniqueCode });
    const isUserEntered = await GateEntry.findOne({ mobileNumber, orgUniqueCode });

    if (!personName || !mobileNumber || !work || !place || !imageUrl || !orgUniqueCode) {
        return next(createCustomError("Please provide all the details", 400));
    }

    if (!isUniqueCodeExist) {
        return next(createCustomError("Unauthorized society", 400));
    }

    console.log(isUserEntered && isUserEntered.isEntered);
    if (isUserEntered && isUserEntered.isEntered) {
        return res.status(200).json({ isSuccess: false, msg: "Person is already entered on society or not done the swipe out" });
    }

    const newEntry = new GateEntry({
        personName,
        mobileNumber,
        work,
        place,
        imageUrl,
        orgUniqueCode
    });

    const enterDetails = await newEntry.save();

    return res.status(200).json(enterDetails);
});

const updateEntry = asyncWrapper(async (req, res, next) => {
    const { mobileNumber, comment, orgUniqueCode } = req.body;

    if (!mobileNumber || !orgUniqueCode) {
        return next(createCustomError("Please provide all the details", 400));
    }

    const isUniqueCodeExist = await SocietyInfo.findOne({ orgUniqueCode });
    if (!isUniqueCodeExist) {
        return next(createCustomError("Unauthorized society", 400));
    }

    const existingUser = await GateEntry.findOne({ mobileNumber, orgUniqueCode });
    if (!existingUser) {
        return next(createCustomError("No record found for the user", 400));
    }

    existingUser.isEntered = false;
    existingUser.dateOut = new Date();
    if (comment) {
        existingUser.comment = comment;
    }

    await existingUser.save();

    return res.status(200).json({ isSuccess: true });
});

const getEntryDetails = asyncWrapper(async (req, res, next) => {
    const { personName, mobileNumber, orgUniqueCode, fromDate, toDate, page = 1 } = req.body;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Validate required parameters
    if (!orgUniqueCode) {
        return next(createCustomError("Please provide the organization unique code", 400));
    }

    // Build the query object
    let query = { orgUniqueCode };

    if (personName) {
        query.personName = new RegExp(personName, 'i'); // Case-insensitive search
    }

    if (mobileNumber) {
        query.mobileNumber = mobileNumber;
    }

    if (fromDate || toDate) {
        query.dateIn = {};
        if (fromDate) {
            query.dateIn.$gte = new Date(fromDate);
        }
        if (toDate) {
            query.dateIn.$lte = new Date(toDate);
        }
    }

    try {
        // Execute the query with pagination
        const records = await GateEntry.find(query)
            .sort({ dateIn: -1 }) // Sorting by dateIn in descending order
            .skip(skip)
            .limit(limit);

        // Count the total number of records matching the query
        const totalRecords = await GateEntry.countDocuments(query);

        // Respond with the results
        return res.status(200).json({
            isSuccess: true,
            totalRecords,
            currentPage: page,
            totalPages: Math.ceil(totalRecords / limit),
            data: records
        });
    } catch (error) {
        return next(createCustomError("Error fetching gate entry details", 500));
    }
});

module.exports = {
    uploadEntry,
    updateEntry,
    getEntryDetails
}