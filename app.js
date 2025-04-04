import dotEnv from 'dotenv';
import express from 'express';
import cors from 'cors';
dotEnv.config();

// const indexRouter = require('./routes');
// const guestRouter = require('./routes/guest/guestRoutes');
// const userRouter = require('./routes/user/userRoutes');
// const adminRouter = require('./routes/admin/adminRoutes');

import indexRouter from './routes';
// import guestRouter from './routes/guest/guestRoutes';
// import userRouter from './routes/user/userRoutes';
// import adminRouter from './routes/admin/adminRoutes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', indexRouter);
// app.use('/guest', guestRouter);
// app.use('/user', userRouter);
// app.use('/admin', adminRouter);

export default app;