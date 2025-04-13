import express from 'express';
const router = express.Router();
import {authRegisteredMiddleware} from "../authValidation.js";
import {
    getUnreadNotificationCountForUser,
    getNotificationsForUser,
    readAllNotificationsForUser
} from "../../services/db/notifications.js";

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

router.get('/', authRegisteredMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId)
        return res.status(400).send('Missing userId');

    const {start, limit} = extractStartAndLimitFromHeaders(req.headers);
    const notifications = await getNotificationsForUser(userId, limit, start);
    if (notifications == undefined)
        return res.status(500).send('Failed to get notifications');

    res.send(notifications);
});

router.post('/read-all', authRegisteredMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId)
        return res.status(400).send('Missing userId');

    const result = await readAllNotificationsForUser(userId);
    if (!result)
        return res.status(400).send('Failed to read all notifications');

    console.log(`> User ${userId} read all notifications`);
    res.send('Notifications marked as read');
});

router.get('/count', authRegisteredMiddleware, async (req, res) => {
    const userId = req.userId;
    if (!userId)
        return res.status(400).send('Missing userId');

    const count = await getUnreadNotificationCountForUser(userId);
    if (count === undefined)
        return res.status(500).send('Failed to get comment count');

    res.send({count});
});

export default router;
