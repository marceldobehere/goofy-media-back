const express = require('express');
const router = express.Router();

const verifyRouter = require('./verify');

router.use('/verify', verifyRouter);

module.exports = router;