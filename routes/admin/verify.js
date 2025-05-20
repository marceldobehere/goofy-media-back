import express from "express";
const router = express.Router();
import { authAdminMiddleware } from "../authValidation.js";

router.get('/', authAdminMiddleware, async (req, res) => {
    const userId = req.userId;
    console.log(`> Admin User ${userId} verified!`);
    res.webCache.medium();
    res.send('Admin verify success');
});


export default router;
