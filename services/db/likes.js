import db from './drizzle/drizzle.js';
import {Likes} from './drizzle/schema.js';
import {eq, desc, count, and} from 'drizzle-orm';
import * as cryptoUtils from '../security/cryptoUtils.js';
import * as users from "./users.js";
import * as rsa from "../security/rsa.js";

const DEFAULT_LIMIT = 30;
const DEFAULT_START = 0;

export async function getAllUserIdsThatLikedPost(postUuid) {
    const res = await db.select()
        .from(Likes)
        .where(eq(Likes.postUuid, postUuid));

    if (res === undefined || res.length < 1)
        return [];

    let userIds = [];
    for (let result of res) {
        userIds.push(result.userId);
    }
    return userIds;
}

export async function getLikedPostUuids(userId, limit, start) {
    if (limit === undefined || typeof limit !== 'number' || limit < 1)
        limit = DEFAULT_LIMIT;
    if (start === undefined || typeof start !== 'number' || start < 0)
        start = DEFAULT_START;

    const res = await db.select()
        .from(Likes)
        .where(eq(Likes.userId, userId))
        .limit(limit)
        .offset(start)
        .orderBy(desc(Likes.likedAt));

    if (res === undefined || res.length < 1)
        return [];

    let likedPosts = [];
    for (let result of res) {
        likedPosts.push(result.postUuid);
    }
    return likedPosts;
}

export async function isPostLiked(userId, postUuid) {
    const res = await db.select()
        .from(Likes)
        .where(and(
            eq(Likes.userId, userId),
            eq(Likes.postUuid, postUuid)
        ));

    if (res === undefined || res.length < 1)
        return false;

    return true;
}


export async function sanitizeLike(like) {
    return {
        userId: like.userId,
        postUuid: like.postUuid,
        likedAt: like.likedAt,
        signature: like.signature
    };
}

export async function validateLike(like) {
    if (typeof like !== "object")
        return "Like is not an object";

    const userId = like.userId;
    if (typeof userId !== "string")
        return "Like userId is not a string";

    if (typeof like.postUuid !== "string")
        return "Like postUuid is not a string";

    if (typeof like.likedAt !== "number")
        return "Like likedAt is not a number";

    const signature = like.signature;
    if (typeof signature !== "string")
        return "Like signature is not a string";

    // check if like likedAt is a valid date
    if (new Date(like.likedAt).toString() === 'Invalid Date') {
        return "INVALID DATE";
    }

    // check if like is not in the future
    if (like.likedAt > Date.now() + 10000) {
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

    const _like = {
        postUuid: like.postUuid,
        likedAt: like.likedAt,
    };

    // Validate Signature
    const verified = await rsa.verifyObj(_like, signature, publicKey);
    if (!verified) {
        return "SIGNATURE INVALID";
    }

    return "OK";
}

export async function addLike(like, ignoreValid) {
    like = await sanitizeLike(like);
    const valid = ignoreValid ? "OK" : (await validateLike(like));
    if (valid !== "OK") {
        console.log("Like validate failed: ", valid, like);
        return false;
    }

    try {
        const res = await db.insert(Likes)
            .values({
                userId: like.userId,
                postUuid: like.postUuid,
                likedAt: like.likedAt,
                signature: like.signature
            });

        if (res.rowsAffected < 1) {
            console.error("Failed to add like: ", like);
            return false;
        }

        return true;
    } catch (e) {
        console.error("Failed to add like: ", like, e);
        return false;
    }
}

export async function removeLike(userId, postUuid) {
    const res = await db.delete(Likes)
        .where(and(
            eq(Likes.userId, userId),
            eq(Likes.postUuid, postUuid)
        ));

    if (res.rowsAffected < 1) {
        console.error("Failed to remove like: ", userId, postUuid);
        return false;
    }

    return true;
}

export async function getAllLikeEntries() {
    const res = await db.select()
        .from(Likes);

    let converted = [];
    for (let like of res) {
        const likeObj = {
            userId: like.userId,
            postUuid: like.postUuid,
            likedAt: like.likedAt,
            signature: like.signature,
        };
        converted.push(likeObj);
    }
    return converted;
}

export async function importAllLikes(data) {
    for (let like of data)
        await addLike(like, true);
}

export async function resetLikeTable() {
    await db.delete(Likes);
}