import db from './drizzle/drizzle.js';
import {PublicUserInfo} from './drizzle/schema.js';
import {eq} from 'drizzle-orm';
import * as cryptoUtils from '../security/cryptoUtils.js';
import * as users from "./users.js";
import * as rsa from "../security/rsa.js";

export async function sanitizePublicInfo(publicInfo) {
    return {
        userId: publicInfo.userId,
        displayName: publicInfo.displayName,
        profileBio: publicInfo.profileBio,
        profilePronouns: publicInfo.profilePronouns,
        profileLinks: publicInfo.profileLinks,
        profileCustomCSS: publicInfo.profileCustomCSS,
        profilePictureUrl: publicInfo.profilePictureUrl,
        profileBannerUrl: publicInfo.profileBannerUrl,
        pinnedPostUuid: publicInfo.pinnedPostUuid,
        updatedAt: publicInfo.updatedAt,
        signature: publicInfo.signature
    };
}

export async function validatePublicInfo(publicInfo) {
    if (typeof publicInfo !== "object")
        return "Public Info is not an object";

    // Basic Info

    const userId = publicInfo.userId;
    if (typeof userId !== "string")
        return "Public Info userId is not a string";

    if (typeof publicInfo.displayName !== "string")
        return "Public Info displayName is not a string";
    if (publicInfo.displayName.length < 0 || publicInfo.displayName.length > 100)
        return "Public Info displayName is not between 0 and 100 characters";

    if (typeof publicInfo.profileBio !== "string")
        return "Public Info profileBio is not a string";
    if (publicInfo.profileBio.length < 0 || publicInfo.profileBio.length > 2000)
        return "Public Info profileBio is not between 0 and 2000 characters";

    if (typeof publicInfo.profilePronouns !== "string")
        return "Public Info profilePronouns is not a string";
    if (publicInfo.profilePronouns.length < 0 || publicInfo.profilePronouns.length > 100)
        return "Public Info profilePronouns is not between 0 and 100 characters";

    if (typeof publicInfo.profileLinks !== "string")
        return "Public Info profileLinks is not a string";
    if (publicInfo.profileLinks.length < 0 || publicInfo.profileLinks.length > 1000)
        return "Public Info profileLinks is not between 0 and 1000 characters";

    if (typeof publicInfo.profileCustomCSS !== "string")
        return "Public Info profileCustomCSS is not a string";
    if (publicInfo.profileCustomCSS.length < 0 || publicInfo.profileCustomCSS.length > 3000)
        return "Public Info profileCustomCSS is not between 0 and 3000 characters";

    // URLS

    if (publicInfo.profilePictureUrl === null)
        publicInfo.profilePictureUrl = undefined;
    if (publicInfo.profileBannerUrl === null)
        publicInfo.profileBannerUrl = undefined;
    if (publicInfo.pinnedPostUuid === null)
        publicInfo.pinnedPostUuid = undefined;

    if (typeof publicInfo.profilePictureUrl !== "string" && publicInfo.profilePictureUrl != undefined)
        return "Public Info profilePictureUrl is not a string";
    if (publicInfo.profilePictureUrl != undefined && publicInfo.profilePictureUrl.length > 200)
        return "Public Info profilePictureUrl is not between 1 and 1000 characters";

    if (typeof publicInfo.profileBannerUrl !== "string" && publicInfo.profileBannerUrl != undefined)
        return "Public Info profileBannerUrl is not a string";
    if (publicInfo.profileBannerUrl != undefined && publicInfo.profileBannerUrl.length > 200)
        return "Public Info profileBannerUrl is not between 1 and 1000 characters";

    if (typeof publicInfo.pinnedPostUuid !== "string" && publicInfo.pinnedPostUuid != undefined)
        return "Public Info pinnedPostUuid is not a string";

    // Date

    if (typeof publicInfo.updatedAt !== "number")
        return "Public Info updatedAt is not a number";
    if (new Date(publicInfo.updatedAt).toString() === 'Invalid Date') {
        return "INVALID DATE";
    }
    if (publicInfo.updatedAt > Date.now() + 10000) {
        return "FUTURE DATE";
    }

    // Check if userId is a valid user

    // Get Public Key
    const publicKey = await users.getPubKeyFromUserId(userId);
    if (publicKey === undefined) {
        return "USER NOT FOUND";
    }

    // Validate User ID
    const actualUserId = await cryptoUtils.userHash(publicKey);
    if (userId !== actualUserId) {
        return "USER ID MISMATCH";
    }

    // Signature

    const signature = publicInfo.signature;
    if (typeof signature !== "string")
        return "Public Info signature is not a string";

    // Validate Signature

    const _publicInfo = {
        userId: publicInfo.userId,
        displayName: publicInfo.displayName,
        profileBio: publicInfo.profileBio,
        profilePronouns: publicInfo.profilePronouns,
        profileLinks: publicInfo.profileLinks,
        profileCustomCSS: publicInfo.profileCustomCSS,
        profilePictureUrl: publicInfo.profilePictureUrl,
        profileBannerUrl: publicInfo.profileBannerUrl,
        pinnedPostUuid: publicInfo.pinnedPostUuid,
        updatedAt: publicInfo.updatedAt
    };
    const verified = await rsa.verifyObj(_publicInfo, signature, publicKey);
    if (!verified) {
        return "SIGNATURE INVALID";
    }

    return "OK";
}

export async function getPublicInfo(userId) {
    const res = await db.select()
        .from(PublicUserInfo)
        .where(eq(PublicUserInfo.userId, userId));

    if (res === undefined || res.length < 1)
        return undefined;

    const info = res[0];
    const infoObj = {
        userId: info.userId,
        displayName: info.displayName,
        profileBio: info.profileBio,
        profilePronouns: info.profilePronouns,
        profileLinks: info.profileLinks,
        profileCustomCSS: info.profileCustomCSS,
        profilePictureUrl: info.profilePictureUrl,
        profileBannerUrl: info.profileBannerUrl,
        pinnedPostUuid: info.pinnedPostUuid,
        updatedAt: info.updatedAt,
        signature: info.signature
    };
    return infoObj;
}


export async function addPublicInfo(publicInfo) {
    publicInfo = await sanitizePublicInfo(publicInfo);
    const valid = await validatePublicInfo(publicInfo);
    if (valid !== "OK") {
        console.log("Public Info validate failed: ", valid, publicInfo);
        return false;
    }

    try {
        const data = {
            userId: publicInfo.userId,
            displayName: publicInfo.displayName,
            profileBio: publicInfo.profileBio,
            profilePronouns: publicInfo.profilePronouns,
            profileLinks: publicInfo.profileLinks,
            profileCustomCSS: publicInfo.profileCustomCSS,
            profilePictureUrl: publicInfo.profilePictureUrl,
            profileBannerUrl: publicInfo.profileBannerUrl,
            pinnedPostUuid: publicInfo.pinnedPostUuid,
            updatedAt: publicInfo.updatedAt,
            signature: publicInfo.signature
        };

        const res = await db.insert(PublicUserInfo)
            .values(data)
            .onConflictDoUpdate({
                target: PublicUserInfo.userId,
                set: data
            });

        if (res.rowsAffected < 1) {
            console.error("Failed to add Public Info: ", publicInfo, res);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Failed to add Public Info: ", publicInfo, e);
        return false;
    }
}

export async function getAllPublicInfoEntries() {
    const res = await db.select()
        .from(PublicUserInfo);

    let converted = [];
    for (let info of res) {
        const infoObj = {
            userId: info.userId,
            displayName: info.displayName,
            profileBio: info.profileBio,
            profilePronouns: info.profilePronouns,
            profileLinks: info.profileLinks,
            profileCustomCSS: info.profileCustomCSS,
            profilePictureUrl: info.profilePictureUrl,
            profileBannerUrl: info.profileBannerUrl,
            pinnedPostUuid: info.pinnedPostUuid,
            updatedAt: info.updatedAt,
            signature: info.signature
        };
        converted.push(infoObj);
    }
    return converted;
}

export async function importAllPublicInfos(data) {
    for (let like of data)
        await addPublicInfo(like);
}

export async function resetPublicInfoTable() {
    await db.delete(PublicUserInfo);
}