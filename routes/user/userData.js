import express from 'express';
const router = express.Router();
import {
    getAllRegisteredUserEntries,
    getPublicKeyFromUserId,
    getUserIdsStartingWithName,
    removeRegisteredUser
} from "../../services/db/users.js";
import {authAdminMiddleware, authRegisteredMiddleware} from "../authValidation.js";


router.get("/like/:query", async (req, res) => {
    const query = req.params.query;
    if (!query)
        return res.status(400).send('Missing query');

    const users = await getUserIdsStartingWithName(query);
    if (users === undefined)
        return res.status(500).send('Failed to get users');

    res.send(users);
});

router.get('/:userId/public-key', async (req, res) => {
    const userId = req.params.userId;
    if (!userId)
        return res.status(400).send('Missing userId');

    const publicKey = await getPublicKeyFromUserId(userId);
    if (publicKey === undefined)
        return res.status(500).send('Failed to get public key');

    res.send({publicKey: publicKey});
});

router.delete("/", authRegisteredMiddleware, async (req, res) => {
    const result = await removeRegisteredUser(req.userId);
    if (!result)
        return res.status(500).send('Failed to remove registered user');

    console.log(`> User ${req.userId} deleted their account`);
    res.send('Account deleted');
});

router.get("/full-export", authRegisteredMiddleware, async (req, res) => {
    res.status(400).send("Not implemented yet...");
});



router.delete("/user/:uuid", authAdminMiddleware, async (req, res) => {
    const userId = req.params.uuid;
    if (!userId)
        return res.status(400).send('Missing userId');

    const result = await removeRegisteredUser(userId);
    if (!result)
        return res.status(500).send('Failed to remove registered user');

    console.log(`> Admin ${req.userId} deleted user:`, userId);
});

router.get("/users/registered", authAdminMiddleware, async (req, res) => {
    const users = await getAllRegisteredUserEntries();
    if (users == undefined)
        return res.status(500).send('Failed to get users');

    res.send(users);
});


export default router;
