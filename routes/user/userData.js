import express from 'express';
const router = express.Router();
import {getPublicKeyFromUserId} from "../../services/db/users.js";


router.get('/:userId/public-key', async (req, res) => {
    const userId = req.params.userId;
    if (!userId)
        return res.status(400).send('Missing userId');

    const publicKey = await getPublicKeyFromUserId(userId);
    if (publicKey === undefined)
        return res.status(500).send('Failed to get public key');

    res.send({publicKey: publicKey});
});


export default router;
