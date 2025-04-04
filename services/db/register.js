import db from './drizzle/drizzle.js';
import {RegisterCodes} from './drizzle/schema.js';
import {and, count, eq, isNull} from 'drizzle-orm';

const getRandomInt = (max) => Math.floor(Math.random() * Math.floor(max));
export const getRandomCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz_0123456789';
    let code = '';
    for (let i = 0; i < 15; i++) {
        code += chars[getRandomInt(chars.length)];
    }
    return code;
}


export async function addNewRegisterCode(admin) {
    const code = getRandomCode();

    try {
        await db.insert(RegisterCodes)
            .values({code, isAdministrator: !!admin, createdAt: Date.now()});
        return code;
    } catch (e) {
        console.error(`Failed to add new register code: ${e.message}`);
        return null;
    }
}

function convertResultToCodeObj(result) {
    console.log("> ConvertResultToCodeObj: ", result);
    if (result == undefined)
        return undefined;

    return {
        code: result.code,
        used: result.usedAt != undefined,
        createdAt: result.createdAt,
        usedAt: result.usedAt,
        userId: result.userId,
        admin: result.isAdministrator
    }
}

export async function getAvailableCode(code, ignoreUsed) {
    try {
        let result;
        if (ignoreUsed)
            result = await db.select()
                .from(RegisterCodes)
                .where(and(eq(RegisterCodes.code, code)))
                .get();
        else
            result = await db.select()
                .from(RegisterCodes)
                .where(and(eq(RegisterCodes.code, code), isNull(RegisterCodes.usedAt)))
                .get();

        return convertResultToCodeObj(result);
    } catch (e) {
        console.error(`Failed to get available code: ${e.message}`);
        return null;
    }
}

export async function checkAvailableCode(code) {
    const codeDoc = await getAvailableCode(code);
    return !!codeDoc;
}

export async function useCode(code, userId) {
    const foundCode = await getAvailableCode(code, userId);
    if (foundCode == undefined && userId == undefined)
        return null;
    console.log(`> Using code: ${code}: `, foundCode);

    try {
        let res;
        if (userId != undefined)
            res = await db.update(RegisterCodes)
                .set({usedAt: Date.now(), userId})
                .where(eq(RegisterCodes.code, code));
        else
            res = await db.update(RegisterCodes)
                .set({usedAt: Date.now()})
                .where(eq(RegisterCodes.code, code));

        console.log("> RES: ", res)
        if (res.rowsAffected < 1)
            return null;
        return foundCode;
    } catch (e) {
        console.error(`Failed to use code: ${e.message}`);
        return null;
    }
}

export async function checkIfAdminCodeWasCreated() {
    try {
        const result = await db.select({codes: count()})
            .from(RegisterCodes)
            .where(eq(RegisterCodes.isAdministrator, true))
            .get();

        return result.codes > 0;
    } catch (e) {
        console.error(`Failed to check if admin code was created: ${e.message}`);
        return false;
    }
}

export async function getAllCodes() {
    try {
        const results = await db.select()
            .from(RegisterCodes);
        return results.map(convertResultToCodeObj);
    } catch (e) {
        console.error(`Failed to get all codes: ${e.message}`);
        return [];
    }
}

export async function deleteUnusedCode(code) {
    try {
        const res = await db.delete(RegisterCodes)
            .where(and(eq(RegisterCodes.code, code), isNull(RegisterCodes.usedAt)));

        return res.rowsAffected > 0;
    } catch (e) {
        console.error(`Failed to delete unused code: ${e.message}`);
        return false;
    }
}

export async function getAllCodeEntries() {
    const result = await db.select()
        .from(RegisterCodes);

    return result.map(x => {
        return {
            code: x.code,
            admin: x.isAdministrator,
            usedBy: x.userId,
            used: x.userId != undefined,
            createdAt: x.createdAt,
            usedAt: x.usedAt
        };
    });
}

export async function importAllRegisterCodes(registerCodes) {
    for (let code of registerCodes) {
        await db.insert(RegisterCodes)
            .values({
                code: code.code,
                isAdministrator: code.admin,
                usedAt: code.usedAt,
                userId: code.usedBy,
                createdAt: code.createdAt
            });
    }
}

export async function resetRegisterCodeTable() {
    await db.delete(RegisterCodes);
}

