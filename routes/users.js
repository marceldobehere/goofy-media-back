const express = require('express');
const router = express.Router();
global.window = this
const JSEncrypt = require('jsencrypt');
const CryptoJS = require('crypto-js');
const crypto = require('crypto')

/* GET users listing. */
router.get('/', function (req, res, next) {
    console.log("> GOT GET REQ: ", req.url)
    console.log(" > GOT Q: ", req.query)
    console.log(" > GOT H: ", req.headers)
    console.log(" > GOT B: ", req.body)
    res.send('respond with a resource');
});


async function getHashFromObj(obj)
{
    let hash = CryptoJS.SHA256(JSON.stringify(obj)).toString(CryptoJS.enc.Base64);
    return hash;
}

async function verifyRequest(body, signature, id, validUntil, publicKey) {
    let hash = await getHashFromObj({body, id, validUntil});
    console.log(" > Obj: ", {body, id, validUntil})
    console.log(" > Hash: ", hash)

    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);

    let verified = encrypt.verify(hash, signature, CryptoJS.SHA256);

    // check if id already exists

    // check if validUntil is in the future
    if (validUntil < Date.now())
        verified = false;

    return verified;
}

function parseHeaders(headers) {
    // 'x-goofy-id': '8733063890',
    // 'x-goofy-signature': 'false',
    // 'x-goofy-valid-until': '1739584991975',
    // 'x-goofy-public-key': '-----BEGIN%20PUBLIC%20KEY-----%0AMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAg%2FcOtBkyj%2Fwv9pmaiVTi%0AW3PUMcBcpSjz7%2F1ZfQqZFX7wtXfxYHI3EQHvArTE6QoLbGk47bZf5
    //  RCvWyfHfTxt%0AK5cjnjq9sZ8rZIf%2F%2BvjKBmJ3X0XRXTGkkRE9cARfp191fGVEH0e7aNbAcT07Bws6%0AMjN5h1%2FXAtvmIXOnBJFW7eCk%2FPDHNod6rjg1f3g%2FcDkPWkVVG87%2B%2FCsKvk7M2mOB%0AMHx2K44b%2F4j4PvgUnz6B
    //  kw6uSDqUXNBJaOqF%2BdjZT84QIeK2iDem4gQGlWSBYheH%0AVlmWCFKvswAICRnv3dtIupxt2DKOfnuxsOViYwKbsQPwiKOOlrutSwk4vKg9dmzR%0AbQIDAQAB%0A-----END%20PUBLIC%20KEY-----',

    let id = headers['x-goofy-id']
    let signature = headers['x-goofy-signature']
    let validUntil = headers['x-goofy-valid-until']
    let publicKey = headers['x-goofy-public-key']

    if (id === undefined || signature === undefined || validUntil === undefined || publicKey === undefined)
        return null;

    try {
      id = parseInt(id)
      validUntil = parseInt(validUntil)
    } catch (e) {
        return null;
    }


    return {id, signature, validUntil, publicKey: decodeURIComponent(publicKey)};
}

router.post('/', async function (req, res, next) {
    console.log("> GOT POST REQ: ", req.url)
    console.log(" > GOT Q: ", req.query)
    console.log(" > GOT H: ", req.headers)
    console.log(" > GOT B: ", req.body)

    let {id, signature, validUntil, publicKey} = parseHeaders(req.headers);
    if (id === null) {
        res.status(400).send("Bad request")
        return;
    }
    console.log(" > Parsed: ")
    console.log(" > id: ", id)
    console.log(" > signature: ", signature)
    console.log(" > validUntil: ", validUntil)
    console.log(" > publicKey: ", publicKey)
    let verified = await verifyRequest(req.body, signature, id, validUntil, publicKey);
    console.log(" > Verified: ", verified)
    if (verified === false) {
        res.status(401).send("Unauthorized")
        return;
    }

    res.send('respond with a resource 2');
});

module.exports = router;
