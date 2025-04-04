import db from './drizzle/drizzle.js';
import {RegisteredUsers} from './drizzle/schema.js';
import {and, count, eq} from 'drizzle-orm';

export async function addRegisteredUser(userId, publicKey, data) {
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

export async function removeRegisteredUser(userId) {
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

export async function getRegisteredUser(userId) {
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

export async function updateRegisteredUser(userId, data) {
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


export async function addTrustedGuestUserIfNotExists(userId, publicKey) {

}

export async function removeTrustedGuestUser(userId) {

}

export async function getTrustedGuestUser(userId) {

}


export async function getPubKeyFromUserId(userId) {
    let user = await getRegisteredUser(userId);
    if (user === undefined)
        user = await getTrustedGuestUser(userId);
    if (user === undefined)
        return undefined;

    return user.publicKey;
}

export async function getAllRegisteredUserEntries() {
    const result = await db.select()
        .from(RegisteredUsers);

    return result.map(x => {
        return {
            userId: x.userId,
            publicKey: x.publicKey,
            data: {
                admin: x.isAdministrator
            }
        };
    });
}

export async function importAllRegisteredUsers(users) {
    for (let user of users)
        await addRegisteredUser(user.userId, user.publicKey, user.data);
}

export async function resetUserTable() {
    await db.delete(RegisteredUsers);
}