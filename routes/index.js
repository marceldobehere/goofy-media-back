import express from "express";

const router = express.Router();

router.get('/', function (req, res, next) {
    res.redirect('https://marceldobehere.github.io/goofy-media-front/');
});

export default router;
