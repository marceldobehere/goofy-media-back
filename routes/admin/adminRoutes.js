import express from 'express';
import verifyRouter from './verify.js';
import codesRouter from './codes.js';
import exportRouter from './export.js';

const router = express.Router();
export default router;


router.use('/verify', verifyRouter);
router.use('/codes', codesRouter);
router.use('/export', exportRouter);
