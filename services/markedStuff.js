import {marked} from "marked";

export const videoTypes = [".mp4", ".mov", ".avi", ".mkv"];
export const imageTypes = [".jpg", ".jpeg", ".png", ".gif"];
export const defaultAllowedTypes = [...videoTypes, ...imageTypes];

export function isFilenameType(filename, allowedTypes) {
    if (filename == undefined)
        return false;

    for (let type of allowedTypes) {
        if (filename.endsWith(type))
            return true;
    }
    return false;
}

function getAllTokens(tokens, tokenList) {
    if (tokenList == undefined)
        tokenList = [];

    // console.log("> Tokens:", tokens);
    for (let token of tokens) {
        tokenList.push(token);
        if (token.tokens != undefined) {
            // console.log("> Sub Tokens:", token.tokens);
            getAllTokens(token.tokens, tokenList);
        }
    }

    return tokenList;
}

export function tryToExtractEmbeddedMedialFromText(text, allowedTypes) {
    if (allowedTypes == undefined)
        allowedTypes = defaultAllowedTypes;

    try {
        const res1 = getAllTokens(marked.lexer(text));
        // console.log("> Res 1:", res1);
        const media = res1.filter((item) => item.type === "image");
        // console.log("> Media:", media);

        const mediaUrls = [];
        for (let item of media) {
            const url = item.href;
            if (isFilenameType(url, allowedTypes))
                mediaUrls.push(url);
        }
        // console.log("> Media URLs:", mediaUrls);

        if (mediaUrls.length > 0)
            return mediaUrls[0];
        return undefined;
    } catch (e) {
        console.error("> Error parsing text: ", e);
        return undefined;
    }
}