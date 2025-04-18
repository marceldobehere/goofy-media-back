import {getUserWebhookNotifEntry} from "./db/userWebhookNotifs.js";

const registerUrl = process.env.REGISTER_DISCORD_WEBHOOK_URL;
const feedbackUrl = process.env.FEEDBACK_DISCORD_WEBHOOK_URL;
const anonFeedbackUrl = process.env.ANON_FEEDBACK_DISCORD_WEBHOOK_URL;
const postUrl = process.env.POST_DISCORD_WEBHOOK_URL;
import { Webhook } from 'discord-webhook-node';

export async function sendRegisterCodeRequest(username, str) {
    try {
        if (registerUrl != undefined && registerUrl != "") {
            const hook = new Webhook(registerUrl);
            hook.setUsername(username);
            await hook.send(str);
            return true;
        }
    } catch (e) {
        console.error("> Error sending message: ", e);
    }
    return false;
}

export async function sendFeedbackRequest(username, str) {
    try {
        if (feedbackUrl != undefined && feedbackUrl != "") {
            const hook = new Webhook(feedbackUrl);
            hook.setUsername(username);
            await hook.send(str);
            return true;
        }
    } catch (e) {
        console.error("> Error sending feedback message: ", e);
    }
    return false;
}

export async function sendAnonFeedbackRequest(str) {
    try {
        if (anonFeedbackUrl != undefined && anonFeedbackUrl != "") {
            const hook = new Webhook(anonFeedbackUrl);
            hook.setUsername("Anonymous Feedback");
            await hook.send(str);
            return true;
        }
    } catch (e) {
        console.error("> Error sending anonymous feedback message: ", e);
    }
    return false;
}

export async function postPosted(username, postHeader, postText, postLinkUrl) {
    try {
        if (postUrl != undefined && postUrl != "") {
            const hook = new Webhook(postUrl);
            hook.setUsername(username);
            await hook.send(`## ${postHeader} - [Link](<${postLinkUrl}>)\n${postText}\n\n`);
            return true;
        }
    } catch (e) {
        console.error("> Error sending post message: ", e);
    }
    return false;
}

export async function sendCustomWebhook(webhookUrl, name, header, text) {
    try {
        if (webhookUrl != undefined && webhookUrl != "") {
            const hook = new Webhook(webhookUrl);
            hook.setUsername(name);
            await hook.send(`### ${header}\n${text}\n\n`);
            return true;
        }
    } catch (e) {
        console.error("> Error sending custom webhook message: ", e);
    }
    return false;
}

export async function sendCustomWebhookToUser(userId, type, name, header, text) {
    const webHookEntry = await getUserWebhookNotifEntry(userId, type);
    if (webHookEntry == undefined)
        return false;

    const webhookUrl = webHookEntry.webhookUrl;
    const webhookService = webHookEntry.webhookService;
    if (webhookService !== "discord")
        return false;

    return await sendCustomWebhook(webhookUrl, name, header, text);
}

export async function sendWebhookGeneralNotificationToUser(userId, header, text) {
    return await sendCustomWebhookToUser(userId, "all-notifications", "Goofy Media Notification", header, text);
}

export async function sendWebhookFeedNotificationToUser(userId, header, text) {
    return await sendCustomWebhookToUser(userId, "new-post-in-feed", "Goofy Media Feed Notification", header, text);
}

// postPosted("test", "title", "this is some text\nvery cool\nyes.", "https://google.at");