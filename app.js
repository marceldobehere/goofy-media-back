import './services/loadConf.js'
import express from 'express';
import cors from 'cors';
import compression from 'compression';


import indexRouter from './routes/index.js';
import guestRouter from './routes/guest/guestRoutes.js';
import userRouter from './routes/user/userRoutes.js';
import adminRouter from './routes/admin/adminRoutes.js';
import smolRouter from './routes/smol/smol.js';

const app = express();

app.use(express.json({limit: '15mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(compression());

app.use('/', indexRouter);
app.use('/guest', guestRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/smol', smolRouter);

export default app;