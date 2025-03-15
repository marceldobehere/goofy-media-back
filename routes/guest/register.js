const express = require('express');
const router = express.Router();
const {lockMiddleware} = require('./../authValidation')
const registerCodes = require('../../services/db/register')
const {authRegisteredMiddleware, authLockMiddleware} = require("../authValidation");
const { addRegisteredUser } = require('../../services/db/users');
const drizzler = require("../../services/db/drizzle/drizzle");

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
            }
            else
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



(async () => {
    await drizzler.promise;

    if (!await registerCodes.checkIfAdminCodeWasCreated()) {
        const code = await registerCodes.addNewRegisterCode(true);
        console.log(`> Added new admin code: ${code}`);
    }
})();


module.exports = router;