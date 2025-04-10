import express from "express";
const router = express.Router();

router.get("/post/:uuid", async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    res.redirect(`${process.env.CLIENT_URL}/user/post?uuid=${encodeURIComponent(uuid)}&serverId=${encodeURIComponent(process.env.SERVER_URL)}`)
});

export default router;