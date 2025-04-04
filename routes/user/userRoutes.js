import express from 'express';
const router = express.Router();

import verifyRouter from './verify.js';
import testRouter from './test.js';
import postRouter from './post.js';

router.use('/verify', verifyRouter);
router.use('/test', testRouter);
router.use('/post', postRouter);

export default router;
