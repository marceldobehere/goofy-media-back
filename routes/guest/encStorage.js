const express = require('express');
const router = express.Router();
const {lockMiddleware} = require('./../authValidation')
const registerCodes = require('../../services/db/register')
const {authRegisteredMiddleware, authLockMiddleware} = require("../authValidation");
const { createOrUpdateEncStorageEntry, getEncStorageEntryUsername, checkEncStorageEntryAvailable } = require('../../services/db/encStorage');

router.post('/secret-storage', lockMiddleware, authRegisteredMiddleware, async (req, res) => {
    const username = req.body.username;
    if (username === undefined || username === '' || typeof username !== 'string') {
        res.status(400).send('Username missing');
        return;
    }
    if (username.length < 6) {
        res.status(400).send('Username too short');
        return;
    }

    const userId = req.userId;
    const body = req.body;

    await res.lock(async () => {
        if (await createOrUpdateEncStorageEntry(userId, body.username, body.data))
            return res.send('Storage success');
        else
            return res.status(400).send('Failed to store data');
    });
});

router.get('/secret-storage/:id', async (req, res) => {
    const username = req.params.id;
    if (username === undefined || username === '' || typeof username !== 'string') {
        res.status(400).send('Username missing');
        return;
    }

    const data = await getEncStorageEntryUsername(username);
    if (data === undefined) {
        res.status(400).send('Data not found');
        return;
    }

    res.send(data);
});



module.exports = router;