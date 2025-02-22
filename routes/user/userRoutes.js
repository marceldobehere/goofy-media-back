const express = require('express');
const router = express.Router();

const verifyRouter = require('./verify');
const testRouter = require('./test');

router.use('/verify', verifyRouter);
router.use('/test', testRouter);

module.exports = router;