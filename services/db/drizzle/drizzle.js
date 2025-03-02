// import { drizzle } from "drizzle-orm/libsql";
// import { createClient } from "@libsql/client";
// import * as schema from './schema';
const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const schema = require('./schema');


const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// export const db = drizzle(client, { schema });

module.exports = drizzle(client, { schema });