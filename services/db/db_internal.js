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


/*
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
let connectionPromiseResolve;
const connectionPromise = new Promise((resolve) => {
    connectionPromiseResolve = resolve;
});
async function run() {
    try {
        // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
        await mongoose.connect(uri, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        connectionPromiseResolve();
    } finally {
        // Ensures that the client will close when you finish/error
        await mongoose.disconnect();
    }
}
run().catch(console.dir);

*/