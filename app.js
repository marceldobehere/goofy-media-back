require('dotenv').config();
const express = require('express');
const cors = require('cors');

const indexRouter = require('./routes');
const guestRouter = require('./routes/guest/guestRoutes');
const userRouter = require('./routes/user/userRoutes');
const adminRouter = require('./routes/admin/adminRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', indexRouter);
app.use('/guest', guestRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

module.exports = app;
