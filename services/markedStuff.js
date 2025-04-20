import {marked} from "marked";

export const videoTypes = [".mp4", ".mov", ".avi", ".mkv"];
export const imageTypes = [".jpg", ".jpeg", ".png", ".gif"];
export const defaultAllowedTypes = [...videoTypes, ...imageTypes];

export function isFilenameType(filename, allowedTypes) {
    if (filename == undefined)
        return false;

    filename = filename.split("?")[0]; // Remove query string

    for (let type of allowedTypes) {
        if (filename.toLowerCase().endsWith(type))
            return true;
    }
    return false;
}

function getAllTokens(tokens, tokenList) {
    if (tokenList == undefined)
        tokenList = [];

    // console.log("> Tokens:", tokens);
    for (let token of tokens)
        if (token.tokens != undefined)
            // console.log("> Sub Tokens:", token.tokens);
            getAllTokens(token.tokens, tokenList);
        else
            tokenList.push(token);

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

        let textStuff = "";
        for (let item of res1) {
            if (item.type == "space")
                textStuff += item.raw;
            else if (item.type == "list")
                textStuff += "\n" + item.raw + "\n";
            else if (typeThing[item.type] != undefined && typeThing[item.type]["accept-text"] == true) {
                if (item.type == "code")
                    textStuff += "\n";
                textStuff += item.text;
                if (typeThing[item.type]["block"] == true)
                    textStuff += "\n";
            }
        }
        textStuff = textStuff.replace(/\n\n\n+/g, "\n\n");

        textStuff = textStuff.trim();

        // console.log("> Text Stuff:", textStuff);

        return {text: textStuff, mediaUrl: mediaUrls[0]}
    } catch (e) {
        console.error("> Error parsing text: ", e);
        return {text: text, mediaUrl: undefined};
    }
}


const typeThing = {
    "blockquote": {
        "accept-text": true,
        "block": true
    },
    "br": {
        "accept-text": false
    },
    "checkbox": {
        "accept-text": false
    },
    "code": {
        "accept-text": true,
        "block": true
    },
    "codespan": {
        "accept-text": true,
        "block": false
    },
    "def": {
        "accept-text": false
    },
    "del": {
        "accept-text": false
    },
    "em": {
        "accept-text": false
    },
    "escape": {
        "accept-text": false
    },
    "generic": {
        "accept-text": true,
        "block": false
    },
    "heading": {
        "accept-text": true,
        "block": true
    },
    "hr": {
        "accept-text": false
    },
    "html": {
        "accept-text": false
    },
    "image": {
        "accept-text": false
    },
    "link": {
        "accept-text": true,
        "block": false
    },
    "list": {
        "accept-text": false
    },
    "list_item": {
        "accept-text": false
    },
    "paragraph": {
        "accept-text": true,
        "block": true
    },
    "space": {
        "accept-text": false
    },
    "strong": {
        "accept-text": false
    },
    "table": {
        "accept-text": false
    },
    "table_cell": {
        "accept-text": true,
        "block": false
    },
    "table_row": {
        "accept-text": false
    },
    "tag": {
        "accept-text": false
    },
    "text": {
        "accept-text": true,
        "block": false
    }
};


/*
	interface Blockquote {
		type: "blockquote";
		raw: string;
		text: string;
		tokens: Token[];
	}
	interface Br {
		type: "br";
		raw: string;
	}
	interface Checkbox {
		checked: boolean;
	}
	interface Code {
		type: "code";
		raw: string;
		codeBlockStyle?: "indented";
		lang?: string;
		text: string;
		escaped?: boolean;
	}
	interface Codespan {
		type: "codespan";
		raw: string;
		text: string;
	}
	interface Def {
		type: "def";
		raw: string;
		tag: string;
		href: string;
		title: string;
	}
	interface Del {
		type: "del";
		raw: string;
		text: string;
		tokens: Token[];
	}
	interface Em {
		type: "em";
		raw: string;
		text: string;
		tokens: Token[];
	}
	interface Escape {
		type: "escape";
		raw: string;
		text: string;
	}
	interface Generic {
		[index: string]: any;
		type: string;
		raw: string;
		tokens?: Token[];
	}
	interface Heading {
		type: "heading";
		raw: string;
		depth: number;
		text: string;
		tokens: Token[];
	}
	interface Hr {
		type: "hr";
		raw: string;
	}
	interface HTML {
		type: "html";
		raw: string;
		pre: boolean;
		text: string;
		block: boolean;
	}
	interface Image {
		type: "image";
		raw: string;
		href: string;
		title: string | null;
		text: string;
	}
	interface Link {
		type: "link";
		raw: string;
		href: string;
		title?: string | null;
		text: string;
		tokens: Token[];
	}
	interface List {
		type: "list";
		raw: string;
		ordered: boolean;
		start: number | "";
		loose: boolean;
		items: ListItem[];
	}
	interface ListItem {
		type: "list_item";
		raw: string;
		task: boolean;
		checked?: boolean;
		loose: boolean;
		text: string;
		tokens: Token[];
	}
	interface Paragraph {
		type: "paragraph";
		raw: string;
		pre?: boolean;
		text: string;
		tokens: Token[];
	}
	interface Space {
		type: "space";
		raw: string;
	}
	interface Strong {
		type: "strong";
		raw: string;
		text: string;
		tokens: Token[];
	}
	interface Table {
		type: "table";
		raw: string;
		align: Array<"center" | "left" | "right" | null>;
		header: TableCell[];
		rows: TableCell[][];
	}
	interface TableCell {
		text: string;
		tokens: Token[];
		header: boolean;
		align: "center" | "left" | "right" | null;
	}
	interface TableRow {
		text: string;
	}
	interface Tag {
		type: "html";
		raw: string;
		inLink: boolean;
		inRawBlock: boolean;
		text: string;
		block: boolean;
	}
	interface Text {
		type: "text";
		raw: string;
		text: string;
		tokens?: Token[];
		escaped?: boolean;
	}
*/