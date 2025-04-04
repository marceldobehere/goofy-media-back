import {drizzle} from "drizzle-orm/libsql";
import {createClient} from "@libsql/client";
import * as schema from './schema.js';
import {migrate} from "drizzle-orm/libsql/migrator";

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const drizzler = drizzle(client, {schema});

drizzler.promise = new Promise(async (res, rej) => {
    try {
        await migrate(drizzler, {
            migrationsFolder: './migrations',
        });

        console.log('Drizzler is ready');
        res(drizzler);
    } catch (e) {
        console.error('Drizzler failed to start', e);
        rej(e);
    }
});

export default drizzler;