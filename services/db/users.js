const dbProm = require('./db_internal');

async function addRegisteredUser(userId, publicKey, data) {
    if (await getRegisteredUser(userId) !== undefined) {
        return false;
    }

    const db = await dbProm;
    const collection = db.collection('registeredUsers');
    const doc = { userId, publicKey, data };
    const count = await collection.insertOne(doc);
    return count > 0;
}

async function removeRegisteredUser(userId) {
    const db = await dbProm;
    const collection = db.collection('registeredUsers');
    const query = { userId };
    const count = await collection.deleteOne(query);
    return count > 0;
}

async function getRegisteredUser(userId) {
    const db = await dbProm;
    const collection = db.collection('registeredUsers');
    const query = { userId };
    const result = await collection
        .find(query)
        .toArray();

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
    const count = await collection.updateOne(query, update);

    return count > 0;
}

async function addTrustedGuestUserIfNotExists(userId, publicKey) {

}

async function removeTrustedGuestUser(userId) {

}

async function getTrustedGuestUser(userId) {

}


module.exports = {
    addRegisteredUser, removeRegisteredUser, getRegisteredUser, updateRegisteredUser,
    addTrustedGuestUserIfNotExists, removeTrustedGuestUser, getTrustedGuestUser
};