import express from "express";
import {getPostByUuid} from "../../services/db/posts.js";
import {getDisplayNameFromUserId} from "../../services/db/users.js";
const router = express.Router();

function escapeHtml(html) {
    return html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getHtmlWithMetadataAndRedirectUrl(url, header, title, description, iconUrl) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta name="description" content="${escapeHtml(description)}">
        <meta property="og:title" content="${escapeHtml(header)}">
        <meta property="og:description" content="${escapeHtml(description)}">
        <meta property="og:image" content="${iconUrl}">
        <meta property="og:url" content="${url}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="${escapeHtml(title)}">
        
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="icon" href="${iconUrl}" type="image/png">
    </head>
    <body>        
        Redirecting to <a href="${url}">${url}</a>

        <script>
            window.location.href = "${url}";
        </script>
    </body>
    </html>
    `;
}

/*
        <br>
        Title: ${escapeHtml(title)}<br>
        Description: ${escapeHtml(description)}<br>
        Icon: <img src="${iconUrl}" alt="Icon" width="16" height="16"><br>
*/

const urlIcon = "https://marceldobehere.github.io/goofy-media-front/icon.ico";

const getHtmlWithMetadataAndRedirect = (url, header, title, description) => {
    if (header.length > 100)
        header = header.substring(0, 100) + "...";
    if (title.length > 100)
        title = title.substring(0, 100) + "...";
    if (description.length > 200)
        description = description.substring(0, 200) + "...";

    return getHtmlWithMetadataAndRedirectUrl(url, header, title, description, urlIcon);
}

export function getSmolPostUrl(postUuid) {
    if (!postUuid)
        return undefined;
    return `${process.env.CLIENT_URL}/user/post?uuid=${encodeURIComponent(postUuid)}&serverId=${encodeURIComponent(process.env.SERVER_URL)}`;
}

export function getSmolUserUrl(userId) {
    if (!userId)
        return undefined;
    return `${process.env.CLIENT_URL}/user/profile?userId=${encodeURIComponent(userId)}&serverId=${encodeURIComponent(process.env.SERVER_URL)}`;
}

function sillyHeader(userId, displayName) {
    if (displayName == "" || displayName == undefined)
        return `@${userId} on Goofy Media`;
    else
        return `${displayName} (@${userId}) on Goofy Media`;
}

router.get("/post/:uuid", async (req, res) => {
    const uuid = req.params.uuid;
    if (!uuid)
        return res.status(400).send('Missing uuid');

    const postInfo = await getPostByUuid(uuid);
    if (postInfo === undefined)
        return res.redirect(getSmolPostUrl(uuid));

    const displayName = await getDisplayNameFromUserId(postInfo.userId);
    const header = sillyHeader(postInfo.userId, displayName);

    res.send(getHtmlWithMetadataAndRedirect(getSmolPostUrl(uuid), header, postInfo.post.title, postInfo.post.text));
});

router.get("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    if (!userId)
        return res.status(400).send('Missing userId');

    const displayName = await getDisplayNameFromUserId(userId);
    const header = sillyHeader(userId, displayName);

    res.send(getHtmlWithMetadataAndRedirect(getSmolUserUrl(userId), header, header, `Showing User Profile for @${userId}`));
});

export default router;