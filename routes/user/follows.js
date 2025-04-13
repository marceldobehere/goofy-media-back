import express from 'express';

const router = express.Router();
import {authRegisteredMiddleware} from "../authValidation.js";
import {addFollowNotification} from "../../services/db/notifications.js";
import {
    addFollow,
    getAllFollowersForUser,
    getAllFollowingForUser,
    isUserFollowing,
    removeFollow
} from "../../services/db/follows.js";

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

router.get('/following', authRegisteredMiddleware, async (req, res) => {
    const following = await getAllFollowingForUser(req.userId);
    if (following == undefined)
        return res.status(500).send('Failed to get following');

    res.send(following);
});

router.get('/followers', authRegisteredMiddleware, async (req, res) => {
    const {start, limit} = extractStartAndLimitFromHeaders(req.headers);
    const followers = await getAllFollowersForUser(req.userId, limit, start);
    if (followers == undefined)
        return res.status(500).send('Failed to get followers');

    res.send(followers);
});

router.get('/user/:userId', authRegisteredMiddleware, async (req, res) => {
    const userId = req.params.userId;
    if (!userId)
        return res.status(400).send('Missing userId');

    const followed = await isUserFollowing(req.userId, userId);
    if (followed === undefined)
        return res.status(500).send('Failed to get follow status');

    res.send({followed: followed});
});

router.post('/user', authRegisteredMiddleware, async (req, res) => {
    const body = req.body;
    if (!body)
        return res.status(400).send('Missing body');
    if (body.follow == undefined)
        return res.status(400).send('Missing follow');

    const follow = body.follow;
    const result = await addFollow(follow);
    if (!result)
        return res.status(500).send('Failed to add follow');

    const followingUserId = follow.followingUserId;
    await addFollowNotification(followingUserId, req.userId);

    res.send('User followed');
});

router.delete('/user/:userId', authRegisteredMiddleware, async (req, res) => {
    const userId = req.params.userId;
    if (!userId)
        return res.status(400).send('Missing userId');

    const followed = await removeFollow(req.userId, userId);
    if (followed === undefined)
        return res.status(500).send('Failed to remove follow');

    if (!followed)
        return res.status(400).send('Failed to remove follow');
    res.send('Follow removed');
});


export default router;
