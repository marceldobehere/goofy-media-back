const express = require('express');
const router = express.Router();
const {authAdminMiddleware} = require("../authValidation");


router.get('/', authAdminMiddleware, async (req, res) => {
    const userId = req.userId;
    console.log(`> Admin User ${userId} verified!`);
    res.send('Admin verify success');
});


module.exports = router;