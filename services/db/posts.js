import db from './drizzle/drizzle.js';
import {Posts, Tags} from './drizzle/schema.js';
import {and, eq, or, desc, like} from 'drizzle-orm';
import * as cryptoUtils from '../security/cryptoUtils.js';
import * as rsa from '../security/rsa.js';
import * as users from './users.js';

const DEFAULT_LIMIT = 50;
const DEFAULT_START = 0;
const DEFAULT_TAG_SEARCH_LIMIT = 30;

/*
Post Structure:

const postBody = {
    title: title,
    text: text,
    tags: tags,
    createdAt: Date.now()
};

const mainBody = {
    post: postBody,
    signature: signature,
    // publicKey: GlobalStuff.publicKey,
    userId: GlobalStuff.userId
};
*/

/*
POST DB
 - uuid: text().primaryKey().notNull(), -> signatureToUUIDHash(signature)
 - userId: text().references(() => RegisteredUsers.userId, {onDelete: 'cascade', onUpdate
 - title: text().notNull(),
 - text: text().notNull(),
 - createdAt: integer('createdAt', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`).notNull(),
 - signature: text().notNull(),
*/

export async function sanitizePost(post) {
    try {
        return {
            title: post.title,
            text: post.text,
            tags: post.tags,
            createdAt: post.createdAt
        };
    } catch (e) {
        return undefined;
    }
}

export async function sanitizePostObj(postObj) {
    try {
        return {
            post: await sanitizePost(postObj.post),
            signature: postObj.signature,
            uuid: postObj.uuid,
            // publicKey: postObj.publicKey, -> Not required as it can be "derived" from userId
            userId: postObj.userId
        };
    } catch (e) {
        return undefined;
    }
}

export async function sanitizePostObjArr(posts) {
    let sanitized = [];
    for (let post of posts) {
        const sanitizedPost = await sanitizePostObj(post);
        if (sanitizedPost !== undefined) {
            // sanitizedPost.uuid = await cryptoUtils.signatureToUUIDHash(post.signature);
            sanitized.push(sanitizedPost);
        }
    }
    return sanitized;
}

export async function verifyPost(postObj) {
    if (postObj === undefined) {
        return "POST OBJ UNDEFINED";
    }

    // Verify Basic Post Structure
    const post = postObj.post;
    if (post === undefined) {
        return "POST UNDEFINED";
    }

    if (post.title === undefined || post.text === undefined || post.tags === undefined || post.createdAt === undefined) {
        return "POST MISSING FIELD";
    }

    if (typeof post.title !== 'string' || typeof post.text !== 'string' || !Array.isArray(post.tags) || typeof post.createdAt !== 'number') {
        return "POST FIELD TYPE INCORRECT";
    }

    if (post.title.length > 200 || post.text.length > 5000 || post.tags.length > 50) {
        return "POST FIELD LENGTH INCORRECT";
    }

    // check if post createdAt is a valid date
    if (new Date(post.createdAt).toString() === 'Invalid Date') {
        return "INVALID DATE";
    }

    // check if post is not in the future
    if (post.createdAt > Date.now() + 10000) {
        return "FUTURE DATE";
    }

    for (let tag of post.tags) {
        if (typeof tag !== 'string') {
            return "TAG NOT STRING";
        }
        if (tag.length > 100) {
            return "TAG TOO LONG";
        }
    }

    // Verify Signature
    const signature = postObj.signature;
    if (signature === undefined || typeof signature !== 'string') {
        return "SIGNATURE MISSING";
    }

    // // Verify Public Key
    // const publicKey = postObj.publicKey;
    // if (publicKey === undefined || typeof publicKey !== 'string') {
    //     return "PUBLIC KEY MISSING";
    // }

    // Verify User ID
    const userId = postObj.userId;
    if (userId === undefined || typeof userId !== 'string') {
        return "USER ID MISSING";
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
    const verified = await rsa.verifyObj(post, signature, publicKey);
    if (!verified) {
        return "SIGNATURE INVALID";
    }

    return "OK";
}

export async function addPost(post, ignoreValid) {
    post = await sanitizePostObj(post);
    if ((ignoreValid == undefined ) && ((await verifyPost(post)) !== "OK")) {
        return false;
    }

    const uuid = await cryptoUtils.signatureToUUIDHash(post.signature);
    try {
        // insert Post Entry
        const res1 = await db.insert(Posts)
            .values({
                uuid,
                userId: post.userId,
                title: post.post.title,
                text: post.post.text,
                createdAt: post.post.createdAt,
                signature: post.signature
            });
        if (res1.rowsAffected < 1) {
            return false;
        }

        // Insert Tags
        const tags = post.post.tags;
        const insertTag = [];
        for (let tag of tags)
            insertTag.push({uuid, tag});

        if (insertTag.length < 1) {
            return true;
        }

        const res2 = await db.insert(Tags)
            .values(insertTag);

        if (res2.rowsAffected < 1) {
            return false;
        }

        return true;
    } catch (e) {
        console.error(`Failed to add post: ${e.message}`);

        try {
            await db.delete(Posts)
                .where(eq(Posts.uuid, uuid));
        } catch (e) {
            console.error(`Failed to remove potentially add post: ${e.message}`);
        }
        return false;
    }
}

export async function getTagsFromPost(postUuid) {
    try {
        const res = await db.select()
            .from(Tags)
            .where(eq(Tags.uuid, postUuid));

        if (res === undefined || res.length < 1)
            return [];

        const tags = [];
        for (let tag of res)
            tags.push(tag.tag);
        return tags;
    } catch (e) {
        console.error(`Failed to get tags: ${e.message}`);
        return [];
    }
}

export async function mapResultToPostObj(result) {
    if (result === undefined)
        return undefined;

    const tags = await getTagsFromPost(result.uuid);

    return {
        post: {
            title: result.title,
            text: result.text,
            tags: tags,
            createdAt: result.createdAt
        },
        signature: result.signature,
        userId: result.userId,
        uuid: result.uuid
    };
}

export async function getWithFilters(filters, limit, start) {
    if (limit === undefined || typeof limit !== 'number' || limit < 1)
        limit = DEFAULT_LIMIT;
    if (start === undefined || typeof start !== 'number' || start < 0)
        start = DEFAULT_START;

    try {
        const res = await db.select()
            .from(Posts)
            .where(and(...filters))
            .orderBy(desc(Posts.createdAt))
            .offset(start)
            .limit(limit);

        if (res === undefined || res.length < 1)
            return [];

        const posts = [];
        for (let result of res) {
            const post = await mapResultToPostObj(result);
            if (post !== undefined)
                posts.push(post);
        }
        return posts;
    } catch (e) {
        console.error(`Failed to get user: ${e.message}`);
        return [];
    }
}

export async function getAllPosts(limit, start) {
    const res = await getWithFilters([], limit, start);
    return res;
}

export async function getPostsByUser(userId, limit, start) {
    const res = await getWithFilters([eq(Posts.userId, userId)], limit, start);
    return res;
}

export async function getPostsByUsers(userIds, limit, start) {
    const filterArray = [];
    for (let userId of userIds)
        filterArray.push(eq(Posts.userId, userId));

    const res = await getWithFilters(or(...filterArray), limit, start);
    return res;
}

export async function getPostsByTag(tag, limit, start) {
    return await getPostsByTags([tag], limit, start);
}

export async function getPostsByTags(tags, limit, start) {
    return await getPostsByTagsAndMaybeUsers(tags, undefined, limit, start);
}

export async function getPostsByUsersAndTags(userIds, tags, limit, start) {
    return await getPostsByTagsAndMaybeUsers(tags, userIds, limit, start);
}

export async function getPostsByTagsAndMaybeUsers(tags, users, limit, start) {
    try {
        const tagFilters = [];
        for (let tag of tags)
            tagFilters.push(eq(Tags.tag, tag));

        const userFilters = [];
        if (users !== undefined)
            for (let user of users)
                userFilters.push(eq(Posts.userId, user));

        if (limit === undefined || typeof limit !== 'number' || limit < 1)
            limit = DEFAULT_LIMIT;
        if (start === undefined || typeof start !== 'number' || start < 0)
            start = DEFAULT_START;

        const bigFilter = (users == undefined) ?
            or(...tagFilters) :
            and(or(...tagFilters), or(...userFilters));

        const res = await db.select()
            .from(Tags)
            .leftJoin(Posts, eq(Tags.uuid, Posts.uuid))
            .where(bigFilter)
            .orderBy(desc(Posts.createdAt))
            .limit(limit)
            .offset(start);

        if (res === undefined || res.length < 1)
            return [];

        const posts = [];
        for (let result of res) {
            const post = await mapResultToPostObj(result.posts);
            if (post !== undefined)
                posts.push(post);
        }

        return posts;
    } catch (e) {
        console.error(`Failed to get user: ${e.message}`);
        return [];
    }
}

export async function getPostByUuid(uuid) {
    try {
        const res = await db.select()
            .from(Posts)
            .where(eq(Posts.uuid, uuid))
            .limit(1);

        if (res === undefined || res.length < 1)
            return undefined;

        const post = await mapResultToPostObj(res[0]);
        return post;
    } catch (e) {
        console.error(`Failed to get post by uuid: ${e.message}`);
        return undefined;
    }
}

export async function getTagsStartingWith(tagStart) {
    try {
        const res = await db.selectDistinct({tag: Tags.tag})
            .from(Tags)
            .where(or(
                eq(Tags.tag, tagStart),
                // eq(Tags.tag, tagStart + "%")
                like(Tags.tag, `${tagStart}%`),
            ))
            .limit(DEFAULT_TAG_SEARCH_LIMIT);

        if (res === undefined || res.length < 1)
            return [];

        const tags = [];
        for (let tag of res)
            tags.push(tag.tag);
        return tags;
    } catch (e) {
        console.error(`Failed to get tags: ${e.message}`);
        return [];
    }
}

export async function getAllPostEntries() {
    const results = await db.select()
        .from(Posts);

    let converted = [];
    for (let post of results) {
        const tags = await getTagsFromPost(post.uuid);
        const postObj = {
            post: {
                tags: tags,
                createdAt: post.createdAt,
                text: post.text,
                title: post.title
            },
            signature: post.signature,
            userId: post.userId
        };
        converted.push(postObj);
    }
    return converted;
}

export async function importAllPosts(data, ignoreValid) {
    for (let post of data)
        await addPost(post, ignoreValid);
}

export async function resetPostAndTagTables() {
    await db.delete(Posts);
    await db.delete(Tags);
}