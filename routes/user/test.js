import express from 'express';
const router = express.Router();
import {authMiddleware, lockMiddleware, authLockMiddleware} from '../authValidation.js'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));


router.get('/', function (req, res, next) {
    console.log("> GOT GET REQ: ", req.url)
    console.log(" > GOT Q: ", req.query)
    // console.log(" > GOT H: ", req.headers)
    res.send('respond with a resource');
});

router.get('/test', lockMiddleware, function (req, res, next) {
    res.lock(async () => {
        console.log("> GOT GET REQ: ", req.url)
        console.log(" > Time:       " + new Date(Date.now()))

        await sleep(2000);

        console.log(" > Responding: " + new Date(Date.now()))
        res.send('respond with a resource');
    });
});


router.post('/', authMiddleware, lockMiddleware, async function (req, res, next) {
    await res.lock(async () => {
        const publicKey = req.publicKey;
        const body = req.body;
        console.log("> GOT POST REQ: ", req.url)
        console.log(" > Time:       " + new Date(Date.now()))
        // console.log(" > GOT Public Key: ", publicKey)
        console.log(" > GOT Body: ", body)

        await sleep(2000);

        console.log(" > Responding: " + new Date(Date.now()))
        res.send('respond with a resource 2: ' + publicKey);
    });
});

router.post('/test', authLockMiddleware, async function (req, res, next) {
    await res.lock(async () => {
        const publicKey = req.publicKey;
        const body = req.body;
        console.log("> GOT POST REQ: ", req.url)
        console.log(" > Time:       " + new Date(Date.now()))
        // console.log(" > GOT Public Key: ", publicKey)
        console.log(" > GOT Body: ", body)

        await sleep(2000);
        if (getRandomInt(10) < 5)
            throw new Error("Random error");

        console.log(" > Responding: " + new Date(Date.now()))
        res.send('respond with a resource 2: ' + publicKey);
    });
});

router.post('/test2', authMiddleware, async function (req, res, next) {
    try {
        {
            const publicKey = req.publicKey;
            const body = req.body;
            console.log("> GOT POST REQ: ", req.url)
            console.log(" > Time:       " + new Date(Date.now()))
            // console.log(" > GOT Public Key: ", publicKey)
            console.log(" > GOT Body: ", body)

            await sleep(2000);
            if (getRandomInt(10) < 5)
                throw new Error("Random error");

            console.log(" > Responding: " + new Date(Date.now()))
            res.send('respond with a resource 2: ' + publicKey);
        }
    } catch (e) {
        console.error("Caught error: ", e)
        res.status(500).send("Internal server error");
    }
});



export default router;
