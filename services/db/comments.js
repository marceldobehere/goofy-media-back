import db from './drizzle/drizzle.js';
import {Comments} from './drizzle/schema.js';
import {and, eq, desc, isNull} from 'drizzle-orm';
import * as cryptoUtils from '../security/cryptoUtils.js';
import * as rsa from '../security/rsa.js';
import * as users from './users.js';

const DEFAULT_LIMIT = 50;
const DEFAULT_START = 0;
const MAX_COMMENT_LEN = 1000;


async function verifyComment(mComment) {
    // console.log("> Verify: ", mComment)
    if (typeof mComment !== "object") {
        return "COMMENT UNDEFINED";
    }

    const comment = mComment.comment;
    if (typeof comment !== "object") {
        return "COMMENT OBJ UNDEFINED";
    }

    const text = comment.text;
    if (typeof text !== "string") {
        return "COMMENT TEXT NOT STRING";
    }

    if (text.length < 1) {
        return "COMMENT TEXT EMPTY";
    }

    if (text.length > MAX_COMMENT_LEN) {
        return "COMMENT TEXT TOO LONG";
    }

    // check if post createdAt is a valid date
    if (new Date(comment.createdAt).toString() === 'Invalid Date') {
        return "INVALID DATE";
    }

    // check if post is not in the future
    if (comment.createdAt > Date.now() + 10000) {
        return "FUTURE DATE";
    }

    // Check Post UUID
    const postUuid = comment.postUuid;
    if (typeof postUuid !== "string") {
        return "NO POST UUID";
    }

    // Check Reply Comment UUID
    const replyCommentUuid = comment.replyCommentUuid;
    if (replyCommentUuid != undefined && typeof replyCommentUuid !== "string") {
        return "REPLY COMMENT UUID NOT STRING";
    }

    const signature = mComment.signature;
    if (signature === undefined || typeof signature !== 'string') {
        return "SIGNATURE MISSING";
    }

    // Validate User
    const userId = mComment.userId;
    if (typeof userId !== "string") {
        return "COMMENT USER ID NOT STRING";
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

    // Validate Signature
    const verified = await rsa.verifyObj(comment, signature, publicKey);
    if (!verified) {
        return "SIGNATURE INVALID";
    }

    return "OK";
}

async function sanitizeComment(comment) {
    try {
        if (comment.comment.replyCommentUuid === null)
            comment.comment.replyCommentUuid = undefined;

        return {
            comment: {
                text: comment.comment.text,
                postUuid: comment.comment.postUuid,
                createdAt: comment.comment.createdAt,
                replyCommentUuid: comment.comment.replyCommentUuid,
            },
            uuid: comment.uuid,
            userId: comment.userId,
            signature: comment.signature
        };
    } catch (e) {
        return undefined;
    }
}

export async function sanitizeCommentArr(comments) {
    let sanitized = [];
    for (let i = 0; i < comments.length; i++) {
        const comment = await sanitizeComment(comments[i]);
        if (comment !== undefined)
            sanitized.push(comment);
    }
    return sanitized;
}

async function mapResultToCommentObj(res) {
    if (res == undefined)
        return undefined;

    if (res.replyCommentUuid === null)
        res.replyCommentUuid = undefined;

    return {
        uuid: res.uuid,
        userId: res.userId,
        signature: res.signature,
        comment: {
            text: res.text,
            postUuid: res.postUuid,
            createdAt: res.createdAt,
            replyCommentUuid: res.replyCommentUuid
        }
    };
}

export async function addComment(comment, ignoreValid) {
    comment = await sanitizeComment(comment);
    if ((ignoreValid == undefined) && ((await verifyComment(comment)) !== "OK")) {
        console.log("Comment verify failed: ", await verifyComment(comment))
        return false;
    }

    const uuid = await cryptoUtils.signatureToUUIDHash(comment.signature);
    try {
        const res = await db.insert(Comments)
            .values({
                uuid: uuid,
                userId: comment.userId,
                postUuid: comment.comment.postUuid,
                replyCommentUuid: comment.comment.replyCommentUuid,
                text: comment.comment.text,
                createdAt: comment.comment.createdAt,
                signature: comment.signature
            });
        if (res.rowsAffected < 1) {
            return false;
        }
        return true;
    } catch (e) {
        console.error(`Failed to add comment: ${e.message}`);
        return false;
    }
}

export async function getMainCommentsForPost(postUuid, limit, start) {
    // console.log("Get Post for: ", postUuid)
    if (limit === undefined || typeof limit !== 'number' || limit < 1)
        limit = DEFAULT_LIMIT;
    if (start === undefined || typeof start !== 'number' || start < 0)
        start = DEFAULT_START;

    const res = await db.select()
        .from(Comments)
        .where(and(
            eq(Comments.postUuid, postUuid),
            isNull(Comments.replyCommentUuid)
        ))
        .limit(limit)
        .offset(start)
        .orderBy(desc(Comments.createdAt));

    if (res === undefined || res.length < 1)
        return [];

    let comments = [];
    for (let result of res) {
        const comment = await mapResultToCommentObj(result);
        if (comment !== undefined)
            comments.push(comment);
    }
    return comments;
}

export async function getRepliesForComment(commentUuid, limit, start) {
    if (limit === undefined || typeof limit !== 'number' || limit < 1)
        limit = DEFAULT_LIMIT;
    if (start === undefined || typeof start !== 'number' || start < 0)
        start = DEFAULT_START;

    const res = await db.select()
        .from(Comments)
        .where(and(
            eq(Comments.replyCommentUuid, commentUuid)
        ))
        .limit(limit)
        .offset(start)
        .orderBy(desc(Comments.createdAt));

    if (res === undefined || res.length < 1)
        return [];

    let comments = [];
    for (let result of res) {
        const comment = await mapResultToCommentObj(result);
        if (comment !== undefined)
            comments.push(comment);
    }
    return comments;
}


export async function getAllCommentEntries() {
    const results = await db.select()
        .from(Comments);

    let converted = [];
    for (let comment of results) {
        if (comment.replyCommentUuid === null)
            comment.replyCommentUuid = undefined;

        const commentObj = {
            comment: {
                postUuid: comment.postUuid,
                replyCommentUuid: comment.replyCommentUuid,
                text: comment.text,
                createdAt: comment.createdAt
            },
            signature: comment.signature,
            userId: comment.userId
        };
        converted.push(commentObj);
    }
    return converted;
}

export async function importAllComments(data, ignoreValid) {
    for (let post of data)
        await addComment(post, ignoreValid);
}

export async function resetCommentTable() {
    await db.delete(Comments);
}