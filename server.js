const express = require('express')
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config()

const app = express()
app.use(cookieParser());
const port = 4000

app.use(express.json());
app.use(require('./routes/auth'));

/* Static Files... */
app.use(express.static(path.join(__dirname, './client/build')));
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, './client/build/index.html'));
});

mongoose.connect(process.env.URI)
    .then(() => { console.log("Database connected...") })
    .catch((e) => { console.log(e) });

app.get('/', (req, res) => {
    res.send('Login Page!');
})

app.get('/signup', (req, res) => {
    res.send('Signup Page!');
})



app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})