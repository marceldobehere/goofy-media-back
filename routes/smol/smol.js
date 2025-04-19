import express from "express";
import {getPostByUuid} from "../../services/db/posts.js";
import {getDisplayNameFromUserId, getPfpUrlFromUserId} from "../../services/db/users.js";
import {isFilenameType, tryToExtractEmbeddedMedialFromText, videoTypes} from "../../services/markedStuff.js";
const router = express.Router();

function escapeHtml(html) {
    return html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, "<br>");
}

function getHtmlWithMetadataAndRedirectUrl(url, header, title, description, iconUrl, makeFullScreen, isVideo) {

    const mediaTypeTag = isVideo ?
        `<meta name="twitter:card" content="player">
         <meta property="og:video" content="${iconUrl}">` :
        `<meta name="twitter:card" content="summary_large_image">
         <meta property="og:image" content="${iconUrl}">`;


    const addedTag = makeFullScreen ? mediaTypeTag :
        `<meta property="og:image" content="${iconUrl}">`;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta property="og:type" content="website">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <title>${title}</title>
        <meta property="og:title" content="${escapeHtml(title)}">
        
        <meta property="og:site_name" content="${escapeHtml(header)}">
        
        <meta name="description" content="${escapeHtml(description)}">
        <meta property="og:description" content="${escapeHtml(description)}">
        
        ${addedTag}
        
        
        
        <meta property="og:url" content="${url}">
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

const websiteIconUrl = "https://marceldobehere.github.io/goofy-media-front/icon.png";
const uknownUserPfpUrl = "https://marceldobehere.github.io/goofy-media-front/unknown_user.png";

const getHtmlWithMetadataAndRedirect = (url, header, title, description, iconUrl) => {
    if (header.length > 100)
        header = header.substring(0, 100) + "...";
    if (title.length > 100)
        title = title.substring(0, 100) + "...";
    if (description.length > 200)
        description = description.substring(0, 200) + "...";
    if (iconUrl == undefined)
        iconUrl = websiteIconUrl;

    return getHtmlWithMetadataAndRedirectUrl(url, header, title, description, iconUrl);
}

const getHtmlWithMetadataAndRedirectAndBigImage = (url, header, title, description, imageUrl) => {
    if (header.length > 100)
        header = header.substring(0, 100) + "...";
    if (title.length > 100)
        title = title.substring(0, 100) + "...";
    if (description.length > 200)
        description = description.substring(0, 200) + "...";

    return getHtmlWithMetadataAndRedirectUrl(url, header, title, description, imageUrl, true, false);
}

const getHtmlWithMetadataAndRedirectAndBigVideo = (url, header, title, description, videoUrl) => {
    if (header.length > 100)
        header = header.substring(0, 100) + "...";
    if (title.length > 100)
        title = title.substring(0, 100) + "...";
    if (description.length > 200)
        description = description.substring(0, 200) + "...";

    return getHtmlWithMetadataAndRedirectUrl(url, header, title, description, videoUrl, true, true);
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
    const pfpUrl = await getPfpUrlFromUserId(postInfo.userId) || uknownUserPfpUrl;
    const header = sillyHeader(postInfo.userId, displayName);
    const postUrl = getSmolPostUrl(uuid);

    // Code to check if it includes an embedded video or image and call the other methods if needed!
    const {text, mediaUrl} = tryToExtractEmbeddedMedialFromText(postInfo.post.text);
    const isVideo = isFilenameType(mediaUrl, videoTypes);
    if (mediaUrl == undefined)
        return res.send(getHtmlWithMetadataAndRedirect(postUrl, header, postInfo.post.title, text, pfpUrl));
    else
    {
        if (isVideo)
            return res.send(getHtmlWithMetadataAndRedirectAndBigVideo(postUrl, header, postInfo.post.title, text, mediaUrl));
        else
            return res.send(getHtmlWithMetadataAndRedirectAndBigImage(postUrl, header, postInfo.post.title, text, mediaUrl));
    }
});

router.get("/user/:userId", async (req, res) => {
    const userId = req.params.userId;
    if (!userId)
        return res.status(400).send('Missing userId');

    const displayName = await getDisplayNameFromUserId(userId);
    const pfpUrl = await getPfpUrlFromUserId(postInfo.userId) || uknownUserPfpUrl;
    const header = sillyHeader(userId, displayName);

    res.send(getHtmlWithMetadataAndRedirect(getSmolUserUrl(userId), header, header, `Showing User Profile for @${userId}`, pfpUrl));
});

export default router;