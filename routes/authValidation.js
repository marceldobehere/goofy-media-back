global.window = this
import JSEncrypt from "jsencrypt";
import CryptoJS from "crypto-js";
import AsyncLock from "./asyncLock.js";
import {userHash} from "../services/security/cryptoUtils.js";
import {getRegisteredUser, getTrustedGuestUser} from "../services/db/users.js";

// check if id exists with public key
let idList = [];
const msExtra = 1000 * 30;

function checkId(publicKey, id, validUntil) {
    // console.log(" > Checking id: ", id, publicKey, validUntil)
    // console.log(" > List: ", idList)
    const now = Date.now();
    if (validUntil < now + 5000 || validUntil > now + msExtra)
        return false;

    // clear list of old entries
    idList = idList.filter(x => x.validUntil > now && x.validUntil < now + msExtra);

    // check if id already exists
    let found = idList.filter(x => x.id === id && x.publicKey === publicKey).length > 0;
    if (found)
        return false;

    // add id to list
    idList.push({id, publicKey, validUntil});
    return true;
}

async function getHashFromObj(obj) {
    let hash = CryptoJS.SHA256(JSON.stringify(obj)).toString(CryptoJS.enc.Base64);
    return hash;
}

async function verifyRequest(body, signature, id, validUntil, publicKey) {
    let hash = await getHashFromObj({body, id, validUntil});
    // console.log(" > Obj: ", {body, id, validUntil})
    // console.log(" > Hash: ", hash)

    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);

    let verified = encrypt.verify(hash, signature, CryptoJS.SHA256);

    // check if id already exists

    // check if validUntil is in the future
    if (validUntil < Date.now() + 5000)
        verified = false;

    // but check if its not too much in the future
    if (validUntil > Date.now() + msExtra)
        verified = false;

    // check id list
    let idCheck = checkId(publicKey, id, validUntil);
    if (!idCheck)
        verified = false;

    return verified;
}

function parseHeaders(headers) {
    let id = headers['x-goofy-id']
    let signature = headers['x-goofy-signature']
    let validUntil = headers['x-goofy-valid-until']
    let publicKey = headers['x-goofy-public-key']

    if (id === undefined || signature === undefined || validUntil === undefined || publicKey === undefined)
        return {id: null, signature: null, validUntil: null, publicKey: null};

    try {
        id = parseInt(id)
        validUntil = parseInt(validUntil)
    } catch (e) {
        return {id: null, signature: null, validUntil: null, publicKey: null};
    }

    return {id, signature: decodeURIComponent(signature), validUntil, publicKey: decodeURIComponent(publicKey)};
}

const authLocks = new Map();

export const authMiddleware = async (req, res, next) => {
    let {id, signature, validUntil, publicKey} = parseHeaders(req.headers);
    if (id === null)
        return res.status(400).send("Unsigned request unauthorized");

    if (req.body == undefined)
        req.body = {};

    // console.log("> Parsed: ")
    // console.log(" > id: ", id)
    // console.log(" > signature: ", signature)
    // console.log(" > validUntil: ", validUntil)
    // console.log(" > publicKey: ", publicKey)
    // console.log(" > Body: ", req.body)
    let verified = await verifyRequest(req.body, signature, id, validUntil, publicKey);
    if (!verified)
        return res.status(401).send("Signature verification failed");

    req.publicKey = publicKey;
    req.userId = await userHash(publicKey);

    await next();
};

export const lockMiddleware = async (req, res, next) => {
    let idx = `${req.url}_${req.method}`;
    if (!authLocks.has(idx))
        authLocks.set(idx, new AsyncLock());
    const lock = authLocks.get(idx);
    // console.log(" > Got lock: ", url, lock)
    res.lock = async (func) => {
        await lock.do(func)
    };
    await next();
};

export const authLockMiddleware = async (req, res, next) => {
    await authMiddleware(req, res, async () => {
        await lockMiddleware(req, res, next);
    });
};

export const authRegisteredMiddleware = async (req, res, next) => {
    await authMiddleware(req, res, async () => {
        const publicKey = req.publicKey;
        const userId = req.userId;

        const user = await getRegisteredUser(userId);
        if (user === undefined)
            return res.status(401).send("Non-Registered request unauthorized");

        req.user = user;
        await next();
    });
}

export const authTrustedGuestMiddleware = async (req, res, next) => {
    await authMiddleware(req, res, async () => {
        const userId = req.userId;
        if (!await getTrustedGuestUser(userId) && !await getRegisteredUser(userId))
            return res.status(401).send("Non-Guest request unauthorized");
        await next();
    });
}

export const authRandomGuestMiddleware = async (req, res, next) => {
    await authMiddleware(req, res, async () => {
        const userId = req.userId;
        await next();
    });
}

export const authAdminMiddleware = async (req, res, next) => {
    await authMiddleware(req, res, async () => {
        const publicKey = req.publicKey;
        const userId = req.userId;

        const user = await getRegisteredUser(userId);
        if (user === undefined)
            return res.status(401).send("Non-Registered request unauthorized");

        const data = user.data;
        if (data === undefined)
            return res.status(401).send("Non-Registered request unauthorized");

        if (!data.admin)
            return res.status(401).send("Non-Admin request unauthorized");

        req.user = user;
        await next();
    });
}