import express from 'express';
import {lockMiddleware} from '../authValidation.js';
import {authRegisteredMiddleware, authLockMiddleware, lockMiddleware} from '../authValidation.js';
import {createOrUpdateEncStorageEntry, getEncStorageEntryUsername} from '../../services/db/encStorage.js';

const router = express.Router();
export default router;

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
    if (body.data === undefined) {
        res.status(400).send('Data missing');
        return;
    }

    await res.lock(async () => {
        if (await createOrUpdateEncStorageEntry(userId, body.username, body.data))
            return res.send('Storage success');
        else
            return res.status(400).send('Failed to store data');
    });
});

router.get('/secret-storage/:id', async (req, res) => {
    const username = req.params.id;
    console.log(`> Get secret storage for username: ${username}`);
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