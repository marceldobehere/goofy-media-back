import express from 'express';
const router = express.Router();
import {
    getAllPosts,
    getPostsByUser,
    getPostsByTag,
    verifyPost,
    addPost,
    sanitizePostObjArr,
    getPostsByUsers,
    getPostsByUsersAndTags,
    getPostByUuid,
    sanitizePostObj,
    getTagsStartingWith,
    findAllValidMentionsInPostText,
    getLikedPostsByUser, getFollowingPostsByUser, deletePostByUuid
} from "../../services/db/posts.js";
import {authRegisteredMiddleware, isUserAdmin} from "../authValidation.js";
import {postPosted, sendWebhookFeedNotificationToUser} from "../../services/webhook.js";
import {getSmolPostUrl} from "../smol/smol.js";
import * as cryptoUtils from "../../services/security/cryptoUtils.js";
import {addMentionNotification} from "../../services/db/notifications.js";
import {getAllFollowersForUser} from "../../services/db/follows.js";

router.post('/verify', authRegisteredMiddleware, async (req, res) => {
    const body = req.body;
    if (!body)
        return res.status(400).send('Missing body');

    const post = body.post;
    if (!post)
        return res.status(400).send('Missing post');

    const verified = await verifyPost(post);
    if (verified !== "OK")
        return res.status(500).send('Failed to verify post: ' + verified);
    res.send({valid:verified});
});

const MAX_USER_LIMIT = 50;
function extractStartAndLimitFromHeaders(headers) {
    let start = headers['query-start'];
    if (start != undefined)
        start = parseInt(start);
    if (Number.isNaN(start))
        start = undefined;
    if (start < 0)
        start = 0;

    let limit = headers['query-limit'];
    if (limit != undefined)
        limit = parseInt(limit);
    if (Number.isNaN(limit))
        limit = undefined;
    else if (limit > MAX_USER_LIMIT)
        limit = MAX_USER_LIMIT;
    if (limit < 0)
        limit = 0;

    // console.log(`> Start: ${start}, Limit: ${limit}`);
    return {start, limit};
}

router.get('/', async (req, res) => {
    const {start, limit} = extractStartAndLimitFromHeaders(req.headers);
    const posts = await getAllPosts(limit, start);
    if (posts == undefined)
        return res.status(500).send('Failed to get posts');

    const sanitized = await sanitizePostObjArr(posts);
    res.send(sanitized);
});

router.get('/user/:user', async (req, res) => {
    const user = req.params.user;
    if (!user)
        return res.status(400).send('Missing user');

    const {start, limit} = extractStartAndLimitFromHeaders(req.headers);
    const posts = await getPostsByUser(user, limit, start);
    if (posts == undefined)
        return res.status(500).send('Failed to get posts');

    const sanitized = await sanitizePostObjArr(posts);
    res.send(sanitized);
});

router.get('/likes', authRegisteredMiddleware, async (req, res) => {
    const {start, limit} = extractStartAndLimitFromHeaders(req.headers);
    const posts = await getLikedPostsByUser(req.userId, limit, start);
    if (posts == undefined)
        return res.status(500).send('Failed to get liked posts');

    const sanitized = await sanitizePostObjArr(posts);
    res.send(sanitized);
});

router.get('/following', authRegisteredMiddleware, async (req, res) => {
    const {start, limit} = extractStartAndLimitFromHeaders(req.headers);
    const posts = await getFollowingPostsByUser(req.userId, limit, start);
    if (posts == undefined)
        return res.status(500).send('Failed to get following posts');

    const sanitized = await sanitizePostObjArr(posts);
    res.send(sanitized);
});

router.get('/tag/:tag', async (req, res) => {
    let tag = req.params.tag;
    if (!tag)
        return res.status(400).send('Missing tag');
    if (typeof tag !== "string")
        return res.status(400).send('Tag is not a string');
    tag = tag.toLowerCase();

    const {start, limit} = extractStartAndLimitFromHeaders(req.headers);
    const posts = await getPostsByTag(tag, limit, start);
    if (posts == undefined)
        return res.status(500).send('Failed to get posts');

    const sanitized = await sanitizePostObjArr(posts);
    res.send(sanitized);
});

router.get('/tags/like/:tag', async (req, res) => {
    let tag = req.params.tag;
    if (!tag)
        return res.status(400).send('Missing tag');
    if (typeof tag !== "string")
        return res.status(400).send('Tag is not a string');
    tag = tag.toLowerCase();

    const tags = await getTagsStartingWith(tag);
    if (tags == undefined)
        return res.status(500).send('Failed to get tags');

    res.send(tags);
});

router.get('/uuid/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    const post = await getPostByUuid(uuid);
    if (post == undefined)
        return res.status(500).send('Failed to get post');

    const sanitized = await sanitizePostObj(post);
    res.send(sanitized);
});

router.delete('/uuid/:uuid', authRegisteredMiddleware, async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    const post = await getPostByUuid(uuid);
    if (post == undefined)
        return res.status(500).send('Failed to get post');

    if ((post.userId !== req.userId) && !(await isUserAdmin(req.userId)))
        return res.status(403).send('You are not allowed to delete this post');

    const result = await deletePostByUuid(uuid);
    if (!result)
        return res.status(500).send('Failed to delete post');

    console.log(`> User ${req.userId} deleted post:`, uuid);

    res.send('Post deleted');
});


const NEWS_USER_IDS = ["mechs_relos868", "holts_plesh_boaty798", "sorer_bull_donko201"];
const NEWS_TAGS = ["news"];
router.get('/news', async (req, res) => {
    const {start, limit} = extractStartAndLimitFromHeaders(req.headers);
    const posts = await getPostsByUsersAndTags(NEWS_USER_IDS, NEWS_TAGS, limit, start);
    if (posts == undefined)
        return res.status(500).send('Failed to get posts');

    const sanitized = await sanitizePostObjArr(posts);
    res.send(sanitized);
});

router.post('/', authRegisteredMiddleware, async (req, res) => {
    const body = req.body;
    if (!body)
        return res.status(400).send('Missing body');
    if (body.post == undefined)
        return res.status(400).send('Missing post');

    const post = body.post;
    const result = await addPost(post);
    if (!result)
        return res.status(500).send('Failed to add post');

    console.log(`> User ${req.userId} added post:`, post.post);

    const uuid = await cryptoUtils.signatureToUUIDHash(post.signature);
    await postPosted(req.userId, post.post.title, post.post.text, getSmolPostUrl(uuid))

    try {
        const mentions = await findAllValidMentionsInPostText(post.post.text, req.user.data.admin);
        for (let mention of mentions)
            await addMentionNotification(mention, req.userId, uuid);
    } catch (e) {
        console.error(`> Sending Mention Notifications failed: `, e, post)
    }

    try {
        const allFollowers = await getAllFollowersForUser(req.userId, 0, 0, true);
        for (let follower of allFollowers) {
            const userId = follower.userId;
            if (userId === req.userId)
                continue;

            await sendWebhookFeedNotificationToUser(userId, `New Post from @${req.userId}`, post.post.title);
        }
    } catch (e) {
        console.error(`> Sending Feed Notifications failed: `, e, post)
    }

    res.send('Post added');
});

export default router;
