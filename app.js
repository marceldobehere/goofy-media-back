import './services/loadConf.js'
import express from 'express';
import cors from 'cors';


import indexRouter from './routes/index.js';
import guestRouter from './routes/guest/guestRoutes.js';
import userRouter from './routes/user/userRoutes.js';
import adminRouter from './routes/admin/adminRoutes.js';

const app = express();

app.use(express.json({limit: '15mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/', indexRouter);
app.use('/guest', guestRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);

export default app;