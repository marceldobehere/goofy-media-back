import express from "express";
const router = express.Router();
import { authAdminMiddleware } from "../authValidation.js";
import * as registerCodes from '../../services/db/register.js';

async function extractCodes() {
    const codes = await registerCodes.getAllCodes();
    if (codes == undefined)
        return undefined;

    let codesResult = [];
    for (let code of codes) {
        codesResult.push({
            code: code.code,
            admin: code.admin,
            used: code.used,
            usedBy: code.userId,
            createdAt: code.createdAt,
            usedAt: code.usedAt
        });
    }

    return codesResult;
}

router.get('/', authAdminMiddleware, async (req, res) => {
    const codes = await extractCodes();
    if (codes == undefined)
        return res.status(500).send('Failed to get codes');
    res.send(codes);
});

router.delete("/:code", authAdminMiddleware, async (req, res) => {
    const code = req.params.code;
    if (!code)
        return res.status(400).send('Missing code');
    const result = await registerCodes.deleteUnusedCode(code);
    if (result == undefined)
        return res.status(500).send('Failed to delete code');
    if (!result)
        return res.status(400).send('Code not found');

    console.log(`> Admin user ${req.userId} deleted code: ${code}`);

    const codes = await extractCodes();
    if (codes == undefined)
        return res.status(500).send('Failed to get codes');
    res.send(codes);
});

router.post('/', authAdminMiddleware, async (req, res) => {
    const body = req.body;
    if (!body)
        return res.status(400).send('Missing body');
    if (body.admin == undefined)
        return res.status(400).send('Missing admin');

    const admin = !!body.admin;
    const code = await registerCodes.addNewRegisterCode(admin);
    if (code == undefined)
        return res.status(500).send('Failed to generate code');

    console.log(`> Admin user ${req.userId} generated new code: ${code} (admin: ${admin})`);
    res.send({code});
});

export default router;