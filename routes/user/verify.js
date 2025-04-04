import express from 'express';
const router = express.Router();
import {authRegisteredMiddleware} from "../authValidation.js";


router.get('/', authRegisteredMiddleware, async (req, res) => {
    const userId = req.userId;
    // console.log(`> Registered User ${userId} verified!`);
    res.send('User verify success');
});


export default router;
