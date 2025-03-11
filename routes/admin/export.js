const express = require('express');
const router = express.Router();
const {authAdminMiddleware} = require("../authValidation");
const registerCodes = require('../../services/db/register');
const {getAllEncStorageEntries, importAllEncStorageEntries} = require("../../services/db/encStorage");
const {getAllCodeEntries, importAllRegisterCodes} = require("../../services/db/register");
const {getAllRegisteredUserEntries, importAllRegisteredUsers} = require("../../services/db/users");
const {getAllPostEntries, importAllPosts} = require("../../services/db/posts");


async function getAllExportData() {

    const encStorage = await getAllEncStorageEntries();
    const registerCodes = await getAllCodeEntries();
    const registeredUsers = await getAllRegisteredUserEntries();
    const posts = await getAllPostEntries();

    const res = {
        encStorage,
        registerCodes,
        registeredUsers,
        posts
    };

    console.log("Exporting data: ", res);
    return res;
}

async function importAllData(data) {
    console.log("Importing data: ", data);

    const encStorage = data.encStorage;
    if (encStorage)
        await importAllEncStorageEntries(encStorage);

    const registerCodes = data.registerCodes;
    if (registerCodes)
        await importAllRegisterCodes(registerCodes);

    const registeredUsers = data.registeredUsers;
    if (registeredUsers)
        await importAllRegisteredUsers(registeredUsers);

    const posts = data.posts;
    if (posts)
        await importAllPosts(posts);

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



module.exports = router;