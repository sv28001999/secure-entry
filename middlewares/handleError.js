const { CustomAPIError } = require('../error/customApiError')

const handleError = (err, req, res, next) => {
    if (err instanceof CustomAPIError) {
        return res.status(err.status).json({ isSuccess: false, msg: err.message })
    }
    console.log(err);
    return res.status(500).json({
        isSuccess: false,
        msg: err.message
    })
}

module.exports = handleError