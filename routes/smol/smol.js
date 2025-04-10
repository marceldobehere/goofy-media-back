import express from "express";
const router = express.Router();

router.get("/post/:uuid", async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    res.redirect(`${process.env.CLIENT_URL}/user/post?uuid=${encodeURIComponent(uuid)}&serverId=${encodeURIComponent(process.env.SERVER_URL)}`)
});

router.get("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    if (!userId)
        return res.status(400).send('Missing userId');

    res.redirect(`${process.env.CLIENT_URL}/user/profile?userId=${encodeURIComponent(userId)}&serverId=${encodeURIComponent(process.env.SERVER_URL)}`)
});

export default router;