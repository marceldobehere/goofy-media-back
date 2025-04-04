require("dotenv").config();

export default {
    schema: "./services/db/drizzle/schema.js",
    out: "./migrations",
    dialect: "turso",
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    },
};