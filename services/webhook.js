const registerUrl = process.env.REGISTER_DISCORD_WEBHOOK_URL;
const feedbackUrl = process.env.FEEDBACK_DISCORD_WEBHOOK_URL;
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

// postPosted("test", "title", "this is some text\nvery cool\nyes.", "https://google.at");