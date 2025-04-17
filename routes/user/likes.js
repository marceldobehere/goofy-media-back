import express from 'express';

const router = express.Router();
import {authRegisteredMiddleware} from "../authValidation.js";
import {
    addLikeNotification
} from "../../services/db/notifications.js";
import {addLike, getAllUserIdsThatLikedPost, isPostLiked, removeLike} from "../../services/db/likes.js";
import {getUserIdFromPostUuid} from "../../services/db/posts.js";

router.get('/post/likes/:uuid', authRegisteredMiddleware, async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    const posterUserId = await getUserIdFromPostUuid(uuid);
    if (posterUserId === undefined)
        return res.status(500).send('Failed to get user id from post uuid');

    if (req.userId != posterUserId)
        return res.status(403).send('You are not allowed to see this');

    const userIds = await getAllUserIdsThatLikedPost(uuid);
    if (userIds === undefined)
        return res.status(500).send('Failed to get user ids');

    return res.send(userIds);
});

router.get('/post/:uuid', authRegisteredMiddleware, async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    const liked = await isPostLiked(req.userId, uuid);
    if (liked === undefined)
        return res.status(500).send('Failed to get liked status');

    res.send({liked});
});

router.post('/post', authRegisteredMiddleware, async (req, res) => {
    const body = req.body;
    if (!body)
        return res.status(400).send('Missing body');
    if (body.like == undefined)
        return res.status(400).send('Missing like');

    const like = body.like;
    const result = await addLike(like);
    if (!result)
        return res.status(500).send('Failed to add like');

    const uuid = like.postUuid;
    const postUserId = await getUserIdFromPostUuid(uuid);
    await addLikeNotification(postUserId, req.userId, uuid);

    res.send('Post liked');
});

router.delete('/post/:uuid', authRegisteredMiddleware, async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    const liked = await removeLike(req.userId, uuid);
    if (liked === undefined)
        return res.status(500).send('Failed to remove like');

    if (!liked)
        return res.status(400).send('Failed to remove like');
    res.send('Like removed');
});


export default router;
