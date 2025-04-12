const url = process.env.REGISTER_DISCORD_WEBHOOK_URL;
import { Webhook } from 'discord-webhook-node';

export async function sendWHMessage(username, str) {
    try {
        if (url != undefined && url != "") {
            const hook = new Webhook(url);
            hook.setUsername(username);
            await hook.send(str);
            return true;
        }
    } catch (e) {
        console.error("> Error sending message: ", e);
    }
    return false;
}