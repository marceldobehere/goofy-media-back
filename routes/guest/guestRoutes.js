const express = require('express');
const router = express.Router();

const registerRouter = require('./register');
const encStorageRouter = require('./encStorage');

router.use('/register', registerRouter);
router.use('/enc', encStorageRouter);


module.exports = router;