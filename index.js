require('dotenv').config();
const express = require('express');
const cors = require('cors');

const indexRouter = require('./routes');
const usersRouter = require('./routes/users');
const guestRouter = require('./routes/guest/guestRoutes');

const index = express();

index.use(express.json());
index.use(express.urlencoded({ extended: false }));
index.use(cors());

index.use('/', indexRouter);
index.use('/users', usersRouter);
index.use('/guest', guestRouter);

module.exports = index;
