const express = require('express');
const app = express();
const router = require('./routes/signup');
const connect = require('./db/connectDB');
const notFound = require('./middlewares/errorPage');
const handleError = require('./middlewares/handleError');
require('dotenv').config();

const port = process.env.PORT || 2800
const startServer = async () => {
    try {
        await connect(process.env.MONGO_URI)
        app.listen(2800, console.log(`Server is listening on port ${port}`));
    }
    catch (err) {
        console.log(err);
    }
}

app.use(express.static('public'));
app.use(express.json());

app.use('/api/v1', router);

app.use(handleError);
app.use(notFound);

startServer();