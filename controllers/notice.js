const Notice = require('../models/Notice');
const asyncWrapper = require('../middlewares/asyncWrapper');
const { createCustomError } = require('../error/customApiError');
const SocietyInfo = require('../models/SocietyInfo');

const addNotice = asyncWrapper(async (req, res, next) => {
    const { noticeTitle, noticeImgUrl, noticeContent, orgUniqueCode } = req.body;

    // Validate required input
    if (!noticeTitle || !orgUniqueCode || !(noticeContent || noticeImgUrl)) {
        return next(createCustomError("Please provide all the required details", 400));
    }

    // Check if the organization exists
    const isUniqueCodeExist = await SocietyInfo.findOne({ orgUniqueCode });
    if (!isUniqueCodeExist) {
        return next(createCustomError("Unauthorized society", 400));
    }

    // Create a new notice
    const newNotice = new Notice({
        noticeTitle,
        noticeImgUrl,
        noticeContent,
        orgUniqueCode
    });

    // Save the new notice to the database
    await newNotice.save();

    // Respond with success
    return res.status(200).json({ isSuccess: true, message: 'Notice added successfully', data: newNotice });
});

const getNotice = asyncWrapper(async (req, res, next) => {
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
        query.noticeCreatedDate = {};
        if (fromDate) {
            query.noticeCreatedDate.$gte = new Date(fromDate);
        }
        if (toDate) {
            query.noticeCreatedDate.$lte = new Date(toDate);
        }
    }

    try {
        // Execute the query with pagination
        const notices = await Notice.find(query)
            .sort({ noticeCreatedDate: -1 }) // Sorting by noticeDate in descending order
            .skip(skip)
            .limit(limit);

        // Count the total number of records matching the query
        const totalNotices = await Notice.countDocuments(query);

        // Respond with the results
        return res.status(200).json({
            isSuccess: true,
            totalRecords: totalNotices,
            currentPage: page,
            totalPages: Math.ceil(totalNotices / limit),
            data: notices
        });
    } catch (error) {
        return next(createCustomError("Error fetching notices", 500));
    }
});

const deleteNotice = asyncWrapper(async (req, res, next) => {
    const { noticeId, orgUniqueCode } = req.body;

    // Validate required input
    if (!noticeId || !orgUniqueCode) {
        return next(createCustomError("Please provide all the required details", 400));
    }

    try {
        // Find and delete the notice
        const notice = await Notice.findOneAndDelete({ _id: noticeId, orgUniqueCode });

        if (!notice) {
            return next(createCustomError("Notice not found or unauthorized action", 404));
        }

        // Respond with success
        return res.status(200).json({ isSuccess: true, message: 'Notice deleted successfully' });
    } catch (error) {
        return next(createCustomError("Error deleting notice", 500));
    }
});

module.exports = {
    addNotice,
    getNotice,
    deleteNotice
}