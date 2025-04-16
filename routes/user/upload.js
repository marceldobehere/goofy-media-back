import express from 'express';
const router = express.Router();
import {authRegisteredMiddleware} from "../authValidation.js";


// Using https://catbox.moe to upload files
router.post('/file', authRegisteredMiddleware, async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const userId = req.userId;
    let uploadedFile = req.files.file;
    if (!uploadedFile) {
        return res.status(400).send('No file was uploaded.');
    }

    const fileName = uploadedFile.name;
    console.log(`> User ${userId} uploaded file ${fileName} (${Math.floor(uploadedFile.size / 1024)} KB)`);

    try {
        const blob = new Blob([uploadedFile.data], {type: uploadedFile.mimetype});
        const data = new FormData();
        data.set('reqtype', 'fileupload');
        data.set('fileToUpload', blob, fileName);

        const _res = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: data
        });

        const text = await _res.text();
        console.log(` > Upload response: ${_res.status} ${_res.statusText}: ${text}`);

        if (_res.ok) {
            return res.status(200).send({url: text});
        } else {
            return res.status(500).send(`Failed to upload file: ${text}`);
        }
    } catch (e) {
        console.error(` > Upload failed: ${e}`);
        return res.status(500).send('Failed to upload file');
    }
});



export default router;
