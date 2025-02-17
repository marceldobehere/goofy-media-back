require('dotenv').config();
const express = require('express');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const guestRouter = require('./routes/guest/guestRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/guest', guestRouter);

module.exports = app;
