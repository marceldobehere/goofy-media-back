import express from 'express';
const router = express.Router();

import verifyRouter from './verify.js';
import testRouter from './test.js';
import postRouter from './post.js';
import userDataRouter from './userData.js';
import commentRouter from './comment.js';

router.use('/verify', verifyRouter);
router.use('/test', testRouter);
router.use('/post', postRouter);
router.use('/user-data', userDataRouter);
router.use('/comment', commentRouter);

export default router;
