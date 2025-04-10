import express from "express";

const router = express.Router();

router.get('/', function (req, res, next) {
    res.redirect(`${process.env.CLIENT_URL}/`);
});

export default router;
