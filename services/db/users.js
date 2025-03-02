const db = require('./drizzle/drizzle');
const {RegisteredUsers} = require('./drizzle/schema');
const {and, count, eq} = require("drizzle-orm");

async function addRegisteredUser(userId, publicKey, data) {
    if (await getRegisteredUser(userId) !== undefined) {
        return false;
    }

    try {
        const res = await db.insert(RegisteredUsers)
            .values({userId, publicKey, isAdministrator: data.admin});

        return res.rowsAffected > 0;
    } catch (e) {
        console.error(`Failed to add registered user: ${e.message}`);
        return false;
    }
}

async function removeRegisteredUser(userId) {
    try {
        const res = await db.delete(RegisteredUsers)
            .where(eq(RegisteredUsers.userId, userId));

        return res.rowsAffected > 0;
    } catch (e) {
        console.error(`Failed to remove registered user: ${e.message}`);
        return false;
    }
}

function mapResultObjToUserData(result) {
    if (result == undefined)
        return undefined;
    return {
        userId: result.userId,
        publicKey: result.publicKey,
        data: {
            admin: result.isAdministrator
        }
    };
};

async function getRegisteredUser(userId) {
    try {
        const result = await db.select()
            .from(RegisteredUsers)
            .where(eq(RegisteredUsers.userId, userId))
            .get();

        return mapResultObjToUserData(result);
    } catch (e) {
        console.error(`Failed to get registered user: ${e.message}`);
        return undefined;
    }
}

async function updateRegisteredUser(userId, data) {
    try {
        const res = await db.update(RegisteredUsers)
            .set({isAdministrator: data.admin})
            .where(eq(RegisteredUsers.userId, userId));

        return res.rowsAffected > 0;
    } catch (e) {
        console.error(`Failed to update registered user: ${e.message}`);
        return false;
    }
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