const express = require('express');
const router = express.Router();
const {authAdminMiddleware} = require("../authValidation");
const registerCodes = require('../../services/db/register');


async function getAllExportData() {

    return {};
}

async function importAllData(data) {
    console.log("Importing data: ", data);

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