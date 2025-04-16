import express from 'express';

const router = express.Router();
import {authRegisteredMiddleware} from "../authValidation.js";
import {addPublicInfo, getPublicInfo} from "../../services/db/publicInfo.js";

// Public for now
router.get('/user/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    const publicInfo = await getPublicInfo(uuid);
    if (publicInfo === undefined)
        return res.status(500).send('Failed to get public info / User does not have public info');

    res.send(publicInfo);
});


router.post('/user', authRegisteredMiddleware, async (req, res) => {
    const body = req.body;
    if (!body)
        return res.status(400).send('Missing body');
    if (body.publicInfo == undefined)
        return res.status(400).send('Missing publicInfo');

    const publicInfo = body.publicInfo;
    const result = await addPublicInfo(publicInfo);
    if (!result)
        return res.status(500).send('Failed to add public info');

    res.send('Public info added');
});

export default router;
