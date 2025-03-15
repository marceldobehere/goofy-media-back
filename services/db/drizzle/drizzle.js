// import { drizzle } from "drizzle-orm/libsql";
// import { createClient } from "@libsql/client";
// import * as schema from './schema';
const {drizzle} = require('drizzle-orm/libsql');
const {createClient} = require('@libsql/client');
const schema = require('./schema');
const {migrate} = require('drizzle-orm/libsql/migrator');

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


module.exports = drizzler;