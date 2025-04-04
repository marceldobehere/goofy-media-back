import db from './drizzle/drizzle.js';
import {EncryptedStorage} from './drizzle/schema.js';
import {eq} from 'drizzle-orm';

export async function createOrUpdateEncStorageEntry(userId, username, data) {
    if (userId === undefined || username === undefined || data === undefined)
        return false;

    const dataStr = JSON.stringify(data);
    if (dataStr.length > 100_000)
        return false;

    // remove old entries if they exist
    await removeEncStorageEntry(userId);

    if (!await checkEncStorageEntryAvailable(username))
        return false;

    try {
        await db.insert(EncryptedStorage)
            .values({userId, username, data: dataStr})
            .onConflictDoUpdate({target: EncryptedStorage.userId, set: {username, data: dataStr}});
        return true;
    } catch (e) {
        console.error(`Failed to create or update entry: ${e.message}`);
        return false;
    }
}

export async function getEncStorageEntryUserId(userId) {
    try {
        const result = await db.select()
            .from(EncryptedStorage)
            .where(eq(EncryptedStorage.userId, userId))
            .get();

        if (result == undefined)
            return undefined;

        return JSON.parse(result.data);
    } catch (e) {
        console.error(`Failed to get entry: ${e.message}`);
        return undefined;
    }
}

export async function getEncStorageEntryUsername(username) {
    try {
        const result = await db.select()
            .from(EncryptedStorage)
            .where(eq(EncryptedStorage.username, username))
            .get();

        if (result == undefined)
            return undefined;

        return JSON.parse(result.data);
    } catch (e) {
        console.error(`Failed to get entry: ${e.message}`);
        return undefined;
    }
}

export async function checkEncStorageEntryAvailable(username) {
    return await getEncStorageEntryUsername(username) === undefined;
}

export async function removeEncStorageEntry(userId) {
    try {
        const res = await db.delete(EncryptedStorage)
            .where(eq(EncryptedStorage.userId, userId));
        return res.rowsAffected > 0;
    } catch (e) {
        console.error(`Failed to remove entry: ${e.message}`);
        return false;
    }
}

export async function getAllEncStorageEntries() {
    const result = await db.select()
        .from(EncryptedStorage);

    return result.map(x => {
        return {
            userId: x.userId,
            username: x.username,
            data: JSON.parse(x.data)
        };
    });
}

export async function importAllEncStorageEntries(data) {
    for (let entry of data)
        await createOrUpdateEncStorageEntry(entry.userId, entry.username, entry.data);
    return true;
}

export async function resetEncStorageTable() {
    await db.delete(EncryptedStorage);
}