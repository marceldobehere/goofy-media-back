import db from './drizzle/drizzle.js';
import {Notifications} from './drizzle/schema.js';
import {eq, desc, count, and} from 'drizzle-orm';
import * as cryptoUtils from '../security/cryptoUtils.js';
import {getAllRegisteredUserEntries} from "./users.js";
import {sendWebhookGeneralNotificationToUser} from "../webhook.js";

const DEFAULT_LIMIT = 60;
const DEFAULT_START = 0;

export async function getUnreadNotificationCountForUser(userId) {
    const res = await db.select({ count: count() })
        .from(Notifications)
        .where(and(
            eq(Notifications.userId, userId),
            eq(Notifications.isRead, false)
        ));

    if (res === undefined || res.length < 1)
        return 0;

    return res[0].count;
}

export async function getNotificationsForUser(userId, limit, start) {
    if (limit === undefined || typeof limit !== 'number' || limit < 1)
        limit = DEFAULT_LIMIT;
    if (start === undefined || typeof start !== 'number' || start < 0)
        start = DEFAULT_START;

    const res = await db.select()
        .from(Notifications)
        .where(eq(Notifications.userId, userId))
        .limit(limit)
        .offset(start)
        .orderBy(desc(Notifications.createdAt));

    if (res === undefined || res.length < 1)
        return [];

    let notifications = [];
    for (let result of res) {
        const notification = {
            uuid: result.uuid,
            userId: result.userId,
            type: result.notificationType,
            createdAt: result.createdAt,
            isRead: result.isRead,
            otherUserId: result.otherUserId,
            postUuid: result.postUuid,
            commentUuid: result.commentUuid,
            commentResponseUuid: result.commentResponseUuid
        };
        notifications.push(notification);
    }
    return notifications;
}

export async function readAllNotificationsForUser(userId) {
    const res = await db.update(Notifications)
        .set({isRead: true})
        .where(eq(Notifications.userId, userId));

    if (res.rowsAffected < 1) {
        console.error("Failed to read all notifications for user: ", userId);
        return false;
    }

    return true;
}

async function verifyNotificationObj(notification) {
    if (typeof notification !== "object")
        return "Notification is not an object";

    if (typeof notification.uuid !== "string")
        return "Notification uuid is not a string";

    if (typeof notification.userId !== "string")
        return "Notification userId is not a string";

    if (typeof notification.type !== "string")
        return "Notification type is not a string";

    if (typeof notification.createdAt !== "number")
        return "Notification createdAt is not a number";

    if (typeof notification.isRead !== "boolean")
        return "Notification isRead is not a boolean";

    return "OK";
}

export async function addFollowNotification(userId, followerUserId) {
    if (userId == followerUserId)
        return;

    const notification = {
        userId: userId,
        type: "follow",
        isRead: false,
        otherUserId: followerUserId
    };

    await sendWebhookGeneralNotificationToUser(userId, `New Follower`, `User @${followerUserId} followed you!`);

    return await addNotification(notification);
}

export async function addLikeNotification(userId, likerUserId, postUuid) {
    if (userId == likerUserId)
        return;

    const notification = {
        userId: userId,
        type: "like",
        isRead: false,
        otherUserId: likerUserId,
        postUuid: postUuid
    };

    await sendWebhookGeneralNotificationToUser(userId, `New Like`, `User @${likerUserId} liked your post!`);

    return await addNotification(notification);
}

export async function addCommentNotification(userId, commenterUserId, postUuid, commentResponseUuid) {
    if (userId == commenterUserId)
        return;

    const notification = {
        userId: userId,
        type: "comment",
        isRead: false,
        otherUserId: commenterUserId,
        postUuid: postUuid,
        commentResponseUuid: commentResponseUuid
    };

    await sendWebhookGeneralNotificationToUser(userId, `New Comment`, `User @${commenterUserId} commented on your post!`);

    return await addNotification(notification);
}

export async function addReplyNotification(userId, replierUserId, postUuid, replyCommentUuid, commentResponseUuid) {
    if (userId == replierUserId)
        return;

    const notification = {
        userId: userId,
        type: "reply",
        isRead: false,
        otherUserId: replierUserId,
        postUuid: postUuid,
        commentUuid: replyCommentUuid,
        commentResponseUuid: commentResponseUuid
    };

    await sendWebhookGeneralNotificationToUser(userId, `New Reply`, `User @${replierUserId} replied to your comment!`);

    return await addNotification(notification);
}

export async function addShareNotification(userId, sharerUserId, postUuid) {
    if (userId == sharerUserId)
        return;

    const notification = {
        userId: userId,
        type: "share",
        isRead: false,
        otherUserId: sharerUserId,
        postUuid: postUuid
    };

    await sendWebhookGeneralNotificationToUser(userId, `New Share`, `User @${sharerUserId} shared your post!`);

    return await addNotification(notification);
}

export async function addMentionNotification(userId, mentionerUserId, postUuid) {
    if (userId == mentionerUserId)
        return;

    if (userId == "everyone") {
        console.log("Adding mention notification to all users: ", userId, mentionerUserId, postUuid);

        const users = await getAllRegisteredUserEntries();
        for (let user of users)
            await addMentionNotification(user.userId, mentionerUserId, postUuid);
        return;
    }

    const notification = {
        userId: userId,
        type: "mention",
        isRead: false,
        otherUserId: mentionerUserId,
        postUuid: postUuid
    };

    await sendWebhookGeneralNotificationToUser(userId, `New Mention`, `User @${mentionerUserId} mentioned you in a post!`);

    return await addNotification(notification);
}

export async function addNotification(notification) {
    if (notification.uuid == undefined)
        notification.uuid = await cryptoUtils.getRandomUUIDHash();

    if (notification.createdAt == undefined)
        notification.createdAt = Date.now();

    if ((await verifyNotificationObj(notification)) !== "OK") {
        console.log("Notification verify failed: ", notification, await verifyNotificationObj(notification));
        return false;
    }

    try {
        const res = await db.insert(Notifications)
            .values({
                uuid: notification.uuid,
                userId: notification.userId,
                notificationType: notification.type,
                createdAt: notification.createdAt,
                isRead: notification.isRead,
                otherUserId: notification.otherUserId,
                postUuid: notification.postUuid,
                commentUuid: notification.commentUuid,
                commentResponseUuid: notification.commentResponseUuid
            });

        if (res.rowsAffected < 1) {
            console.error("Failed to add notification: ", notification);
            return false;
        }

        return true;
    } catch (e) {
        console.error("Failed to add notification: ", notification, e);
        return false;
    }
}


export async function getAllNotificationEntries() {
    const res = await db.select()
        .from(Notifications);

    let converted = [];
    for (let notif of res) {
        const notifObj = {
            uuid: notif.uuid,
            userId: notif.userId,
            type: notif.notificationType,
            createdAt: notif.createdAt,
            isRead: notif.isRead,
            otherUserId: notif.otherUserId,
            postUuid: notif.postUuid,
            commentUuid: notif.commentUuid,
            commentResponseUuid: notif.commentResponseUuid
        };
        converted.push(notifObj);
    }
    return converted;
}

export async function importAllNotifications(data) {
    for (let notification of data)
        await addNotification(notification);
}

export async function resetNotificationTable() {
    await db.delete(Notifications);
}