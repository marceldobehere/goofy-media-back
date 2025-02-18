const dbProm = require('./db_internal');
const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));
const getRandomCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz_0123456789';
    let code = '';
    for (let i = 0; i < 15; i++) {
        code += chars[getRandomInt(chars.length)];
    }
    return code;
}

async function addNewRegisterCode() {
    const db = await dbProm;
    const collection = db.collection('registerCodes');
    const code = getRandomCode();
    const doc = { code, used: false, createdAt: Date.now(), usedAt: null, userId: null };
    await collection.insertOne(doc);
    return code;
}

async function checkAvailableCode(code) {
    const db = await dbProm;
    const collection = db.collection('registerCodes');
    const query = { code, used: false };
    const result = await collection
        .find(query)
        .toArray();
    return result.length > 0;
}

async function useCode(code, userId) {
    if (!await checkAvailableCode(code)) {
        return false;
    }

    const db = await dbProm;
    const collection = db.collection('registerCodes');
    const query = { code };
    const update = { $set: { used: true, usedAt: Date.now(), userId } };
    const result = await collection.updateOne(query, update);
    return result.modifiedCount > 0;
}


module.exports = { addNewRegisterCode, checkAvailableCode, useCode };