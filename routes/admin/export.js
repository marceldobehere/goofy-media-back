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

    const res = {
        encStorage,
        registerCodes,
        registeredUsers,
        posts,
        comments,
        notifications
    };

    console.log("> Exported data: ", res);
    return res;
}

async function importAllData(data) {
    console.log("> Importing data: ", data);

    // Delete Data
    console.log(" > Resetting tables");
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