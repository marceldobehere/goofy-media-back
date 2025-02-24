const dbProm = require('./db_internal');

async function addRegisteredUser(userId, publicKey, data) {
    if (await getRegisteredUser(userId) !== undefined) {
        return false;
    }

    const db = await dbProm;
    const collection = db.collection('registeredUsers');
    const doc = { userId, publicKey, data };
    const res = await collection.insertOne(doc);
    // console.log("> Inserted: ", res);
    return res != undefined && res.acknowledged;
}

async function removeRegisteredUser(userId) {
    const db = await dbProm;
    const collection = db.collection('registeredUsers');
    const query = { userId };
    const res = await collection.deleteOne(query);
    // console.log("> Deleted: ", res);
    return res != undefined && res.acknowledged;
}

async function getRegisteredUser(userId) {
    const db = await dbProm;
    const collection = db.collection('registeredUsers');
    const query = { userId };
    const result = await collection
        .find(query)
        .toArray();

    // console.log("> Found: ", result);
    if (result.length === 0) {
        return undefined;
    }

    return result[0];
}

async function updateRegisteredUser(userId, data) {
    const db = await dbProm;
    const collection = db.collection('registeredUsers');
    const query = {userId};
    const update = {$set: {data}};
    const res = await collection.updateOne(query, update);
    // console.log("> Updated: ", res);
    return res != undefined && res.acknowledged;
}

async function addTrustedGuestUserIfNotExists(userId, publicKey) {

}

async function removeTrustedGuestUser(userId) {

}

async function getTrustedGuestUser(userId) {

}


async function getPubKeyFromUserId(userId) {
    let user = await getRegisteredUser(userId);
    if (user === undefined)
        user = await getTrustedGuestUser(userId);
    if (user === undefined)
        return undefined;

    return user.publicKey;
}


module.exports = {
    addRegisteredUser, removeRegisteredUser, getRegisteredUser, updateRegisteredUser,
    addTrustedGuestUserIfNotExists, removeTrustedGuestUser, getTrustedGuestUser, getPubKeyFromUserId
};