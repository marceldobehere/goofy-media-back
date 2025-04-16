import express from 'express';
const router = express.Router();

import verifyRouter from './verify.js';
import testRouter from './test.js';
import postRouter from './post.js';
import userDataRouter from './userData.js';
import commentRouter from './comment.js';
import notificationsRouter from './notifications.js';
import likesRouter from './likes.js';
import followsRouter from './follows.js';
import uploadRouter from './upload.js';

router.use('/verify', verifyRouter);
router.use('/test', testRouter);
router.use('/post', postRouter);
router.use('/user-data', userDataRouter);
router.use('/comment', commentRouter);
router.use('/notifications', notificationsRouter);
router.use('/likes', likesRouter);
router.use('/follows', followsRouter);
router.use('/upload', uploadRouter);

export default router;
