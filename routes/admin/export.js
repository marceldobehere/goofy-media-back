import express from 'express';
const router = express.Router();
import {authAdminMiddleware} from "../authValidation.js";
import * as registerCodes from '../../services/db/register.js';
import {getAllEncStorageEntries, importAllEncStorageEntries, resetEncStorageTable} from "../../services/db/encStorage.js";
import {getAllCodeEntries, importAllRegisterCodes, resetRegisterCodeTable} from "../../services/db/register.js";
import {getAllRegisteredUserEntries, importAllRegisteredUsers, resetUserTable} from "../../services/db/users.js";
import {getAllPostEntries, importAllPosts, resetPostAndTagTables} from "../../services/db/posts.js";
import {getAllCommentEntries, importAllComments, resetCommentTable} from "../../services/db/comments.js";
import {
    getAllNotificationEntries,
    importAllNotifications,
    resetNotificationTable
} from "../../services/db/notifications.js";
import {getAllLikeEntries, importAllLikes, resetLikeTable} from "../../services/db/likes.js";
import {getAllFollowEntries, importAllFollows, resetFollowTable} from "../../services/db/follows.js";
import {getAllPublicInfoEntries, importAllPublicInfos, resetPublicInfoTable} from "../../services/db/publicInfo.js";
import {
    getAllUserWebhookNotifEntries,
    importAllUserWebhookNotifEntries,
    resetUserWebhookNotifsTable
} from "../../services/db/userWebhookNotifs.js";


async function getAllExportData() {
    console.log("> Exporting data");

    console.log(" > Exporting Enc Storage");
    const encStorage = await getAllEncStorageEntries();
    console.log(" > Exporting Register Codes");
    const registerCodes = await getAllCodeEntries();
    console.log(" > Exporting Registered Users");
    const registeredUsers = await getAllRegisteredUserEntries();
    console.log(" > Exporting Posts");
    const posts = await getAllPostEntries();
    console.log(" > Exporting Comments");
    const comments = await getAllCommentEntries();
    console.log("> Exporting Notifications")
    const notifications = await getAllNotificationEntries();
    console.log(" > Exporting Likes");
    const likes = await getAllLikeEntries();
    console.log(" > Exporting Follows");
    const follows = await getAllFollowEntries();
    console.log(" > Exporting Public Info");
    const publicInfo = await getAllPublicInfoEntries();
    console.log(" > Exporting Webhook Notifs");
    const webhookNotifs = await getAllUserWebhookNotifEntries();

    const res = {
        encStorage,
        registerCodes,
        registeredUsers,
        posts,
        comments,
        notifications,
        likes,
        follows,
        publicInfo,
        webhookNotifs
    };

    console.log("> Exported data: ", res);
    return res;
}

async function importAllData(data) {
    console.log("> Importing data: ", data);

    // Delete Data
    console.log(" > Resetting tables");
    await resetUserWebhookNotifsTable();
    await resetPublicInfoTable();
    await resetFollowTable();
    await resetLikeTable();
    await resetNotificationTable();
    await resetCommentTable()
    await resetPostAndTagTables();
    await resetRegisterCodeTable();
    await resetEncStorageTable();
    await resetUserTable();

    // Import Data
    console.log(" > Importing Registered Users");
    const registeredUsers = data.registeredUsers;
    if (registeredUsers)
        await importAllRegisteredUsers(registeredUsers);

    console.log(" > Importing Enc Storage");
    const encStorage = data.encStorage;
    if (encStorage)
        await importAllEncStorageEntries(encStorage);

    console.log(" > Importing Register Codes");
    const registerCodes = data.registerCodes;
    if (registerCodes)
        await importAllRegisterCodes(registerCodes);

    console.log(" > Importing Posts");
    const posts = data.posts;
    if (posts)
        await importAllPosts(posts, true);

    console.log(" > Importing Comments");
    const comments = data.comments;
    if (comments)
        await importAllComments(comments, true);

    console.log(" > Importing Notifications");
    const notifications = data.notifications;
    if (notifications)
        await importAllNotifications(notifications);

    console.log(" > Importing Likes");
    const likes = data.likes;
    if (likes)
        await importAllLikes(likes);

    console.log(" > Importing Follows");
    const follows = data.follows;
    if (follows)
        await importAllFollows(follows);

    console.log(" > Importing Public Info");
    const publicInfo = data.publicInfo;
    if (publicInfo)
        await importAllPublicInfos(publicInfo);

    console.log(" > Importing Webhook Notifs");
    const webhookNotifs = data.webhookNotifs;
    if (webhookNotifs)
        await importAllUserWebhookNotifEntries(webhookNotifs);


    console.log("> Imported data!");
    return true;
}


router.get('/', authAdminMiddleware, async (req, res) => {
    const codes = await getAllExportData();
    if (codes == undefined)
        return res.status(500).send('Failed to get export');
    res.send(codes);
});

router.post('/', authAdminMiddleware, async (req, res) => {
    const body = req.body;
    if (!body)
        return res.status(400).send('Missing body');

    const result = await importAllData(body);
    if (result == undefined)
        return res.status(500).send('Failed to import data');
    if (!result)
        return res.status(400).send('Failed to import data');
    res.send(result);
});



export default router;