const notFound = (req, res) => {
    res.status(400).send({
        isSuccess: false,
        msg: "Route not found for this page"
    })
}

module.exports = notFound