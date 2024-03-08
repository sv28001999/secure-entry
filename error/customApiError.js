class CustomAPIError extends Error{
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

const createCustomError = (msg, statusCode) => {
    return new CustomAPIError(msg, statusCode)
}

module.exports = { CustomAPIError, createCustomError }