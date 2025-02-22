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

async function addNewRegisterCode(admin) {
    const db = await dbProm;
    const collection = db.collection('registerCodes');
    const code = getRandomCode();
    const doc = { code, used: false, createdAt: Date.now(), usedAt: null, userId: null, admin: !!admin };
    await collection.insertOne(doc);
    return code;
}

async function getAvailableCode(code) {
    const db = await dbProm;
    const collection = db.collection('registerCodes');
    const query = { code, used: false };
    const result = await collection
        .find(query)
        .toArray();
    return result[0];
}

async function checkAvailableCode(code) {
    const codeDoc = await getAvailableCode(code);
    return !!codeDoc;
}

async function useCode(code, userId) {
    const foundCode = await getAvailableCode(code);
    if (foundCode == undefined)
        return null;
    console.log(`> Using code: ${code}: `, foundCode);

    const db = await dbProm;
    const collection = db.collection('registerCodes');
    const query = { code };
    const update = { $set: { used: true, usedAt: Date.now(), userId } };
    const result = await collection.updateOne(query, update);
    if (result.modifiedCount < 1) {
        return null;
    }

    return foundCode;
}

async function checkIfAdminCodeWasCreated() {
    const db = await dbProm;
    const collection = db.collection('registerCodes');
    const query = { admin: true };
    const result = await collection
        .find(query)
        .toArray();
    return result.length > 0;
}

async function getAllCodes() {
    const db = await dbProm;
    const collection = db.collection('registerCodes');
    const result = await collection
        .find({})
        .toArray();
    return result;
}

async function deleteUnusedCode(code) {
    const db = await dbProm;
    const collection = db.collection('registerCodes');
    const query = { code, used: false };
    const result = await collection.deleteOne(query);
    return result.deletedCount > 0;
}

module.exports = { addNewRegisterCode, checkAvailableCode, useCode, checkIfAdminCodeWasCreated, getAllCodes, deleteUnusedCode };