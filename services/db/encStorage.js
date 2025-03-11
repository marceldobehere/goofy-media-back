const dbProm = require('./db_internal');

async function createOrUpdateEncStorageEntry(userId, username, data) {
    if (userId === undefined || username === undefined || data === undefined)
        return false;

    const dataStr = JSON.stringify(data);
    if (dataStr.length > 100_000)
        return false;

    // remove old entries if they exist
    await removeEncStorageEntry(userId);

    if (!await checkEncStorageEntryAvailable(username))
        return false;

    const db = await dbProm;
    const collection = db.collection('encStorage');
    const query = { userId };
    const update = { $set: { userId, username, data: JSON.stringify(data) } };
    const res = await collection.updateOne(query, update, { upsert: true });
    return res != undefined && res.acknowledged;
}

async function getEncStorageEntryUserId(userId) {
    const db = await dbProm;
    const collection = db.collection('encStorage');
    const query = { userId };
    const result = await collection
        .find(query)
        .toArray();

    if (result.length === 0) {
        return undefined;
    }

    try {
        return JSON.parse(result[0].data);
    } catch (e) {
        return undefined;
    }
}

async function getEncStorageEntryUsername(username) {
    const db = await dbProm;
    const collection = db.collection('encStorage');
    const query = { username };
    const result = await collection
        .find(query)
        .toArray();

    if (result.length === 0) {
        // console.log(`> Not found: ${username}`);
        return undefined;
    }

    try {
        // console.log(`> Found: `, result);
        return JSON.parse(result[0].data);
    } catch (e) {
        return undefined;
    }
}

async function checkEncStorageEntryAvailable(username) {
    return await getEncStorageEntryUsername(username) === undefined;
}

async function removeEncStorageEntry(userId) {
    const db = await dbProm;
    const collection = db.collection('encStorage');
    const query = { userId };
    // delete all entries with this userId
    const res = await collection.deleteMany(query);
    if (res == undefined || !res.acknowledged)
        return false;
    return res.deletedCount > 0;
}

async function getAllEncStorageEntries() {
    const db = await dbProm;
    const collection = db.collection('encStorage');
    const result = await collection
        .find({})
        .toArray();

    return result.map(x => {
        return {
            userId: x.userId,
            username: x.username,
            data: JSON.parse(x.data)
        };
    });
}

async function importAllEncStorageEntries(data) {
    // clear all entries from the table
    const db = await dbProm;
    const collection = db.collection('encStorage');
    await collection.deleteMany({});

    // insert all entries
    for (let entry of data) {
        await createOrUpdateEncStorageEntry(entry.userId, entry.username, entry.data);
    }
    return true;
}



module.exports = { createOrUpdateEncStorageEntry, getEncStorageEntryUserId, getEncStorageEntryUsername, removeEncStorageEntry, checkEncStorageEntryAvailable,
    getAllEncStorageEntries, importAllEncStorageEntries };