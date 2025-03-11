const express = require('express');
const router = express.Router();

const verifyRouter = require('./verify');
const codesRouter = require('./codes');
const exportRouter = require('./export');

router.use('/verify', verifyRouter);
router.use('/codes', codesRouter);
router.use('/export', exportRouter);

module.exports = router;