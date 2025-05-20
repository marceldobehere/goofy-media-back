import './services/loadConf.js'
import express from 'express';
import http2Express from 'http2-express';
import cors from 'cors';
import compression from 'compression';
import fileUpload from 'express-fileupload';

import indexRouter from './routes/index.js';
import guestRouter from './routes/guest/guestRoutes.js';
import userRouter from './routes/user/userRoutes.js';
import adminRouter from './routes/admin/adminRoutes.js';
import smolRouter from './routes/smol/smol.js';
import {webCacheMiddleware} from "./services/webCache.js";

// const app = express();
const app = http2Express(express);

app.use(express.json({limit: '15mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cors({maxAge: 86400}));
app.use(compression());
app.use(fileUpload({
    // useTempFiles: true,
    // tempFileDir: '/tmp/',
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
}));
app.use(webCacheMiddleware);

app.use('/', indexRouter);
app.use('/guest', guestRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/smol', smolRouter);

export default app;