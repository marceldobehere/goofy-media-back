const express = require('express');
const router = express.Router();
const {getAllPosts, getPostsByUser, getPostsByTag, verifyPost, addPost, sanitizePostObjArr, getPostsByUsers,
    getPostsByUsersAndTags
} = require("../../services/db/posts");
const {authRegisteredMiddleware} = require("../authValidation");

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

router.get('/', async (req, res) => {
    const posts = await getAllPosts();
    if (posts == undefined)
        return res.status(500).send('Failed to get posts');

    const sanitized = await sanitizePostObjArr(posts);
    res.send(sanitized);
});

router.get('/user/:user', async (req, res) => {
    const user = req.params.user;
    if (!user)
        return res.status(400).send('Missing user');
    const posts = await getPostsByUser(user);
    if (posts == undefined)
        return res.status(500).send('Failed to get posts');

    const sanitized = await sanitizePostObjArr(posts);
    res.send(sanitized);
});

router.get('/tag/:tag', async (req, res) => {
    const tag = req.params.tag;
    if (!tag)
        return res.status(400).send('Missing tag');
    const posts = await getPostsByTag(tag);
    if (posts == undefined)
        return res.status(500).send('Failed to get posts');

    const sanitized = await sanitizePostObjArr(posts);
    res.send(sanitized);
});

const NEWS_USER_IDS = ["mechs_relos868"];
const NEWS_TAGS = ["news"];
router.get('/news', async (req, res) => {
    const posts = await getPostsByUsersAndTags(NEWS_USER_IDS, NEWS_TAGS);
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
    res.send('Post added');
});

module.exports = router;