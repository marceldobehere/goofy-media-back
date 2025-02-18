const { MongoClient } = require("mongodb");
const connectionString = process.env.DB_URL;
const client = new MongoClient(connectionString);

const prom = new Promise(async (resolve, reject) => {
    let conn;
    try {
        conn = await client.connect();
    } catch(e) {
        console.error(e);
    }
    let db = conn.db("test_db");
    resolve(db);
});

module.exports = prom;