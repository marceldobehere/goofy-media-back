import express from 'express';
import {authLockMiddleware, authRandomGuestMiddleware, authRegisteredMiddleware} from '../authValidation.js';
import * as registerCodes from '../../services/db/register.js';
import {addRegisteredUser} from '../../services/db/users.js';
import drizzler from '../../services/db/drizzle/drizzle.js';
import {sendWHMessage} from "../../services/webhook.js";

const router = express.Router();
export default router;

router.get('/code/:id', async (req, res) => {
    const id = req.params.id;
    if (id === undefined) {
        res.status(400).send('Bad request');
        return;
    }

    if (!await registerCodes.checkAvailableCode(id))
        return res.status(400).send('Code not available');

    res.send('Code available');
});

router.post('/code', authLockMiddleware, async (req, res) => {
    const code = req.body.code;
    if (code === undefined) {
        res.status(400).send('Bad request');
        return;
    }
    const publicKey = req.publicKey;
    const userId = req.userId;
    if (publicKey === undefined) {
        res.status(401).send('Unauthorized');
        return;
    }

    res.lock(async () => {
        const usedCode = await registerCodes.useCode(code);
        if (usedCode) {
            if (await addRegisteredUser(userId, publicKey, {admin: !!usedCode.admin})) {
                const usedCode2 = await registerCodes.useCode(code, userId);
                if (usedCode2)
                    return res.send('Register success');
                else
                    res.status(500).send('Failed to use code');
            } else
                return res.status(400).send('Failed to register user');
        } else {
            res.status(400).send('Register code not available');
        }
    });
});

router.post('/login-test', authRegisteredMiddleware, async (req, res) => {
    const publicKey = req.publicKey;
    const userId = req.userId;
    const body = req.body;

    console.log(`> User ${userId} logged in with public key:\r\n${publicKey}`);
    console.log(`> Body: ${JSON.stringify(body)}`);

    res.send('Login success');
});

router.post('/register-msg', authRandomGuestMiddleware, async (req, res) => {
    const msg = req.body.msg;
    if (typeof msg !== "string") {
        res.status(400).send('Bad request');
        return;
    }

    if (msg.length > 1000) {
        res.status(400).send('Message too long');
        return;
    }

    const userId = req.userId;

    const result = await sendWHMessage(userId, msg);

    if (result)
        res.send('Message sent');
    else
        res.status(500).send('Failed to send message');
});

(async () => {
    await drizzler.promise;

    if (!await registerCodes.checkIfAdminCodeWasCreated()) {
        const code = await registerCodes.addNewRegisterCode(true);
        console.log(`> Added new admin code: ${code}`);
    }
})();