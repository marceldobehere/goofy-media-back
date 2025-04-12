import express from 'express';
const router = express.Router();
import {authRegisteredMiddleware} from "../authValidation.js";
import {sendFeedbackRequest, sendRegisterCodeRequest} from "../../services/webhook.js";


router.get('/', authRegisteredMiddleware, async (req, res) => {
    // const userId = req.userId;
    // console.log(`> Registered User ${userId} verified!`);
    res.send('User verify success');
});

router.post('/feedback-msg', authRegisteredMiddleware, async (req, res) => {
    const msg = req.body.msg;
    if (typeof msg !== "string") {
        res.status(400).send('Bad request');
        return;
    }
    if (msg.length > 2000) {
        res.status(400).send('Message too long');
        return;
    }

    const userId = req.userId;
    const result = await sendFeedbackRequest(userId, msg);

    if (result)
        res.send('Feedback sent');
    else
        res.status(500).send('Failed to send feedback');
});


export default router;
