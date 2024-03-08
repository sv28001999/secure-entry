const asyncWrapper = (fn) => {
    return async (req, res, next) => {
        console.log("asyncWrap start")
        try {
            console.log("asyncWrap try")
            await fn(req, res, next)
        }
        catch (err) {
            console.log("asyncWrap catch")
            next(err)
            // res.json(err)
        }
    }
}

module.exports = asyncWrapper;