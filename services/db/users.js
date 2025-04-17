import db from './drizzle/drizzle.js';
import {PublicUserInfo, RegisteredUsers} from './drizzle/schema.js';
import {eq, like, or} from 'drizzle-orm';

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

export async function getPublicKeyFromUserId(userId) {
    const registeredUser = await getRegisteredUser(userId);
    if (registeredUser !== undefined)
        return registeredUser.publicKey;

    // Check trusted / guest users

    // Ask other servers in trusted network

    return undefined;
}

export async function getDisplayNameFromUserId(userId) {
    if (userId === undefined)
        return undefined;

    try {
        const res = await db.select({
            displayName: PublicUserInfo.displayName
        })
            .from(PublicUserInfo)
            .where(eq(PublicUserInfo.userId, userId))
            .get();

        if (res === undefined || res.displayName === undefined)
            return undefined;

        return res.displayName;
    } catch (e) {
        console.error(`Failed to get display name from userId: ${e.message}`);
        return undefined;
    }
}

const USER_SEARCH_LIMIT = 20;

export async function getUserIdsStartingWithUserId(userId) {
    userId = userId.replaceAll("%", "").replaceAll("_", "");
    if (userId == "")
        return [];

    try {
        const res = await db.select({
            userId: RegisteredUsers.userId,
        })
            .from(RegisteredUsers)
            .where(or(
                eq(RegisteredUsers.userId, userId),
                like(RegisteredUsers.userId, `${userId}%`)
            ))
            .limit(USER_SEARCH_LIMIT);

        if (res === undefined || res.length < 1)
            return [];

        const users = [];
        for (let user of res)
            users.push(user.userId);
        return users;
    } catch (e) {
        console.error(`Failed to get user IDs by id: ${e.message}`);
        return [];
    }
}

export async function getUserIdsStartingWithUsername(username) {
    username = username.replaceAll("%", "").replaceAll("_", "");
    if (username == "")
        return [];

    // need to join with public info to get the display name
    try {
        const res = await db.select({
            userId: RegisteredUsers.userId
        })
            .from(RegisteredUsers)
            .leftJoin(PublicUserInfo, eq(PublicUserInfo.userId, RegisteredUsers.userId))
            .where(or(
                eq(PublicUserInfo.displayName, username),
                like(PublicUserInfo.displayName, `${username}%`)
            ))
            .limit(USER_SEARCH_LIMIT);

        if (res === undefined || res.length < 1)
            return [];

        const users = [];
        for (let user of res)
            users.push(user.userId);
        return users;
    } catch (e) {
        console.error(`Failed to get user IDs by name: ${e.message}`);
        return [];
    }
}


export async function getUserIdsStartingWithName(name) {
    const p1 = getUserIdsStartingWithUsername(name);
    const p2 = getUserIdsStartingWithUserId(name);

    const [users1, users2] = await Promise.all([p1, p2]);
    const users = [];
    for (let user of users1)
        users.push(user);
    for (let user of users2)
        if (!users.includes(user))
            users.push(user);
    return users;
}