import db from './drizzle/drizzle.js';
import {UserWebhookNotifs} from './drizzle/schema.js';
import {and, eq} from 'drizzle-orm';

export async function createOrUpdateUserWebhookNotifEntry(userId, webhookService, webhookUrl, webhookType) {
    if (userId === undefined || webhookService === undefined || webhookUrl === undefined || webhookType === undefined)
        return false;

    if (webhookUrl.length > 1000)
        return false;

    if (webhookType.length > 100)
        return false;

    if (webhookService.length > 100)
        return false;

    try {
        await db.insert(UserWebhookNotifs)
            .values({userId, webhookService, webhookUrl, webhookType})
            .onConflictDoUpdate({
                target: [UserWebhookNotifs.userId, UserWebhookNotifs.webhookType],
                set: {
                    webhookService,
                    webhookUrl,
                    webhookType
                }
            });
        return true;
    } catch (e) {
        console.error(`Failed to create or update entry: ${e.message}`);
        return false;
    }
}


export async function getUserWebhookNotifEntry(userId, webhookType) {
    try {
        const res = await db.select()
            .from(UserWebhookNotifs)
            .where(and(
                eq(UserWebhookNotifs.userId, userId),
                eq(UserWebhookNotifs.webhookType, webhookType)
            ));

        if (res == undefined || res.length < 1)
            return undefined;

        return {
            userId: res[0].userId,
            webhookService: res[0].webhookService,
            webhookUrl: res[0].webhookUrl,
            webhookType: res[0].webhookType,
        };
    } catch (e) {
        console.error(`Failed to get entry: ${e.message}`);
        return undefined;
    }
}

export async function getAllUserWebhookNotifEntries() {
    const result = await db.select()
        .from(UserWebhookNotifs);

    return result.map(x => {
        return {
            userId: x.userId,
            webhookService: x.webhookService,
            webhookUrl: x.webhookUrl,
            webhookType: x.webhookType,
        };
    });
}

export async function importAllUserWebhookNotifEntries(data) {
    for (let entry of data)
        await createOrUpdateUserWebhookNotifEntry(entry.userId, entry.webhookService, entry.webhookUrl, entry.webhookType);
    return true;
}

export async function resetUserWebhookNotifsTable() {
    await db.delete(UserWebhookNotifs);
}