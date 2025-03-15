const express = require('express');
const router = express.Router();
const {authAdminMiddleware} = require("../authValidation");
const registerCodes = require('../../services/db/register');
const {getAllEncStorageEntries, importAllEncStorageEntries, resetEncStorageTable} = require("../../services/db/encStorage");
const {getAllCodeEntries, importAllRegisterCodes, resetRegisterCodeTable} = require("../../services/db/register");
const {getAllRegisteredUserEntries, importAllRegisteredUsers, resetUserTable} = require("../../services/db/users");
const {getAllPostEntries, importAllPosts, resetPostAndTagTables} = require("../../services/db/posts");


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

    const res = {
        encStorage,
        registerCodes,
        registeredUsers,
        posts
    };

    console.log("> Exported data: ", res);
    return res;
}

async function importAllData(data) {
    console.log("> Importing data: ", data);

    // Delete Data
    console.log(" > Resetting tables");
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
        await importAllPosts(posts);

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



module.exports = router;