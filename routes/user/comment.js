import express from 'express';
const router = express.Router();
import {
    getAllPosts, getPostsByUser, getPostsByTag, verifyPost, addPost, sanitizePostObjArr, getPostsByUsers,
    getPostsByUsersAndTags, getPostByUuid, sanitizePostObj, getTagsStartingWith
} from "../../services/db/posts.js";
import {authRegisteredMiddleware} from "../authValidation.js";
import {
    addComment,
    getMainCommentsForPost,
    getRepliesForComment, getReplyCountForComment,
    sanitizeCommentArr
} from "../../services/db/comments.js";

const MAX_USER_LIMIT = 30;
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

router.post('/', authRegisteredMiddleware, async (req, res) => {
    const body = req.body;
    if (!body)
        return res.status(400).send('Missing body');
    if (body.comment == undefined)
        return res.status(400).send('Missing comment');

    const comment = body.comment;
    const result = await addComment(comment);
    if (!result)
        return res.status(500).send('Failed to add comment');

    console.log(`> User ${req.userId} added comment:`, comment.comment);
    res.send('Comment added');
});

router.get('/post/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    const {start, limit} = extractStartAndLimitFromHeaders(req.headers);
    const comments = await getMainCommentsForPost(uuid, limit, start);
    if (comments == undefined)
        return res.status(500).send('Failed to get comments');

    const sanitized = await sanitizeCommentArr(comments);
    res.send(sanitized);
});

router.get('/replies/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    const {start, limit} = extractStartAndLimitFromHeaders(req.headers);
    const comments = await getRepliesForComment(uuid, limit, start);
    if (comments == undefined)
        return res.status(500).send('Failed to get reply comments');

    const sanitized = await sanitizeCommentArr(comments);
    res.send(sanitized);
});

router.get('/reply-count/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    const comments = await getReplyCountForComment(uuid);
    res.send({count: comments});
});

export default router;
