import db from './drizzle/drizzle.js';
import {Follows} from './drizzle/schema.js';
import {eq, desc, count, and} from 'drizzle-orm';
import * as cryptoUtils from '../security/cryptoUtils.js';
import * as users from "./users.js";
import * as rsa from "../security/rsa.js";

const DEFAULT_LIMIT = 30;
const DEFAULT_START = 0;

export async function getAllFollowersForUser(userId, limit, start){
    if (limit === undefined || typeof limit !== 'number' || limit < 1)
        limit = DEFAULT_LIMIT;
    if (start === undefined || typeof start !== 'number' || start < 0)
        start = DEFAULT_START;

    const res = await db.select()
        .from(Follows)
        .where(eq(Follows.followingUserId, userId))
        .limit(limit)
        .offset(start)
        .orderBy(desc(Follows.followedAt));

    if (res === undefined || res.length < 1)
        return [];

    let followers = [];
    for (let result of res)
        followers.push({userId: result.userId, followedAt: result.followedAt});
    return followers;
}

export async function getAllFollowingForUser(userId) {
    const res = await db.select()
        .from(Follows)
        .where(eq(Follows.userId, userId))
        .orderBy(desc(Follows.followedAt));

    if (res === undefined || res.length < 1)
        return [];

    let followingUsers = [];
    for (let result of res)
        followingUsers.push(result.followingUserId);
    return followingUsers;
}

export async function isUserFollowing(userId, followingUserId) {
    const res = await db.select()
        .from(Follows)
        .where(and(
            eq(Follows.userId, userId),
            eq(Follows.followingUserId, followingUserId)
        ));

    if (res === undefined || res.length < 1)
        return false;

    return true;
}


export async function sanitizeFollow(follow) {
    return {
        userId: follow.userId,
        followingUserId: follow.followingUserId,
        followedAt: follow.followedAt,
        signature: follow.signature
    };
}

export async function validateFollow(follow) {
    if (typeof follow !== "object")
        return "Follow is not an object";

    const userId = follow.userId;
    if (typeof userId !== "string")
        return "Follow userId is not a string";

    if (typeof follow.followingUserId !== "string")
        return "Follow followingUserId is not a string";

    if (typeof follow.followedAt !== "number")
        return "Follow followedAt is not a number";

    const signature = follow.signature;
    if (typeof signature !== "string")
        return "Follow signature is not a string";

    // check if follow followedAt is a valid date
    if (new Date(follow.followedAt).toString() === 'Invalid Date') {
        return "INVALID DATE";
    }

    // check if follow is not in the future
    if (follow.followedAt > Date.now() + 10000) {
        return "FUTURE DATE";
    }

    // Get Public Key
    const publicKey = await users.getPubKeyFromUserId(userId);
    if (publicKey === undefined) {
        return "USER NOT FOUND";
    }

    // Validate User ID
    const actualUserId = await cryptoUtils.userHash(publicKey);
    if (userId !== actualUserId) {
        return "USER ID MISMATCH";
    }

    const _follow = {
        followingUserId: follow.followingUserId,
        followedAt: follow.followedAt,
    };

    // Validate Signature
    const verified = await rsa.verifyObj(_follow, signature, publicKey);
    if (!verified) {
        return "SIGNATURE INVALID";
    }

    return "OK";
}

export async function addFollow(follow) {
    follow = await sanitizeFollow(follow);
    const valid = await validateFollow(follow);
    if (valid !== "OK") {
        console.log("Follow validate failed: ", valid, follow);
        return false;
    }

    try {
        const res = await db.insert(Follows)
            .values({
                userId: follow.userId,
                followingUserId: follow.followingUserId,
                followedAt: follow.followedAt,
                signature: follow.signature
            });

        if (res.rowsAffected < 1) {
            console.error("Failed to add follow: ", follow);
            return false;
        }

        return true;
    } catch (e) {
        console.error("Failed to add follow: ", follow, e);
        return false;
    }
}

export async function removeFollow(userId, followingUserId) {
    const res = await db.delete(Follows)
        .where(and(
            eq(Follows.userId, userId),
            eq(Follows.followingUserId, followingUserId)
        ));

    if (res.rowsAffected < 1) {
        console.error("Failed to remove follow: ", userId, followingUserId);
        return false;
    }

    return true;
}

export async function getAllFollowEntries() {
    const res = await db.select()
        .from(Follows);

    let converted = [];
    for (let follow of res) {
        const followObj = {
            userId: follow.userId,
            followingUserId: follow.followingUserId,
            followedAt: follow.followedAt,
            signature: follow.signature,
        };
        converted.push(followObj);
    }
    return converted;
}

export async function importAllFollows(data) {
    for (let follow of data)
        await addFollow(follow);
}

export async function resetFollowTable() {
    await db.delete(Follows);
}