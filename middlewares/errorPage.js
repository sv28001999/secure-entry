const notFound = (req, res) => {
    res.status(400).send("Route not found for this page")
}

module.exports = notFound