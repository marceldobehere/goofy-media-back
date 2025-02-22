const express = require('express');
const router = express.Router();
const {authRegisteredMiddleware} = require("../authValidation");


router.get('/', authRegisteredMiddleware, async (req, res) => {
    const userId = req.userId;
    console.log(`> Registered User ${userId} verified!`);
    res.send('User verify success');
});


module.exports = router;