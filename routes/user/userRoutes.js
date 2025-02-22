const express = require('express');
const router = express.Router();

const verifyRouter = require('./verify');
const testRouter = require('./test');
const postRouter = require('./post');

router.use('/verify', verifyRouter);
router.use('/test', testRouter);
router.use('/post', postRouter);

module.exports = router;