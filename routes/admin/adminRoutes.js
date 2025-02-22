const express = require('express');
const router = express.Router();

const verifyRouter = require('./verify');
const codesRouter = require('./codes');

router.use('/verify', verifyRouter);
router.use('/codes', codesRouter);

module.exports = router;