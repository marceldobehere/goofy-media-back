const dbProm = require('./db_internal');
const cryptoUtils = require('../security/cryptoUtils');
const rsa = require('../security/rsa');
const users = require('./users');

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

async function sanitizePost(post) {
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

async function sanitizePostObj(postObj) {
    try {
        return {
            post: await sanitizePost(postObj.post),
            signature: postObj.signature,
            // publicKey: postObj.publicKey, -> Not required as it can be "derived" from userId
            userId: postObj.userId
        };
    } catch (e) {
        return undefined;
    }
}

async function sanitizePostObjArr(posts) {
    let sanitized = [];
    for (let post of posts) {
        const sanitizedPost = await sanitizePostObj(post);
        if (sanitizedPost !== undefined) {
            sanitized.push(sanitizedPost);
        }
    }
    return sanitized;
}

async function verifyPost(postObj) {
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

async function addPost(post) {
    post = await sanitizePostObj(post);
    if ((await verifyPost(post)) !== "OK") {
        return false;
    }

    const db = await dbProm;
    const collection = db.collection('posts');
    const res = await collection.insertOne(post);
    return res != undefined && res.acknowledged;
}

const DEFAULT_LIMIT = 50;
const DEFAULT_START = 0;

async function getCollection(collection, filter, limit, start) {
    if (limit === undefined || typeof limit !== 'number' || limit < 1)
        limit = DEFAULT_LIMIT;
    if (start === undefined || typeof start !== 'number' || start < 0)
        start = DEFAULT_START;

    return await collection.find(filter).sort({"post.createdAt":-1}).skip(start).limit(limit).toArray();
}

async function getAllPosts(limit, start) {
    const db = await dbProm;
    const collection = db.collection('posts');
    const res = await getCollection(collection, {}, limit, start);
    return res;
}

async function getPostsByUser(userId, limit, start) {
    const db = await dbProm;
    const collection = db.collection('posts');
    const res = await getCollection(collection, {userId: userId}, limit, start);
    return res;
}

async function getPostsByUsers(userIds, limit, start) {
    const db = await dbProm;
    const collection = db.collection('posts');
    const res = await getCollection(collection, {userId: {$in: userIds}}, limit, start);
    return res;
}

async function getPostsByTag(tag, limit, start) {
    const db = await dbProm;
    const collection = db.collection('posts');
    console.log(`Getting posts by tag: "${tag}"`);
    const res = await getCollection(collection, {"post.tags": tag}, limit, start);
    return res;
}

async function getPostsByTags(tags, limit, start) {
    const db = await dbProm;
    const collection = db.collection('posts');
    const res = await getCollection(collection, {"post.tags": {$in: tags}}, limit, start);
    return res;
}

async function getPostsByUsersAndTags(userIds, tags, limit, start) {
    const db = await dbProm;
    const collection = db.collection('posts');
    const res = await getCollection(collection, {userId: {$in: userIds}, "post.tags": {$in: tags}}, limit, start);
    return res;
}

async function getAllPostEntries() {
    const db = await dbProm;
    const collection = db.collection('posts');
    const result = await collection
        .find({})
        .toArray();
    return result.map(x => {
        return {
            post: x.post,
            signature: x.signature,
            userId: x.userId
        };
    });
}

async function importAllPosts(posts) {
    // clear all entries from the table
    const db = await dbProm;
    const collection = db.collection('posts');
    await collection.deleteMany({});
    // insert all entries
    const insertPosts = posts.map(x => {
        return {
            post: x.post,
            signature: x.signature,
            userId: x.userId
        };
    });

    await collection.insertMany(insertPosts);
    return true;
}

module.exports = {
    verifyPost,
    addPost,
    getAllPosts,
    getPostsByUser,
    getPostsByTag,
    sanitizePostObj,
    sanitizePostObjArr,
    getPostsByUsers,
    getPostsByTags,
    getPostsByUsersAndTags,
    getAllPostEntries,
    importAllPosts
}