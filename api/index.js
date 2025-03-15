#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const https = require('https');

const DATA_PATH = __dirname + "/../data";

let SSL = false;
if (process.argv.length > 2 &&
    process.argv[2].toLowerCase() === 'ssl')
    SSL = true;

if (!fs.existsSync(DATA_PATH))
{
    fs.mkdirSync(DATA_PATH);
}

if (SSL && !fs.existsSync(DATA_PATH + "/ssl"))
{
    console.log("SSL FOLDER DOESNT EXIST");
    console.log();
    console.log("To create the ssl keys, open a terminal in the data folder and run the following commands:");
    console.log("mkdir ssl");
    console.log("cd ssl");
    console.log("openssl genrsa -out key.pem");
    console.log("openssl req -new -key key.pem -out csr.pem");
    console.log("openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem");
    process.exit(1);
}

var app = require('../app');
const drizzler = require("../services/db/drizzle/drizzle");

(async () => {
    let server;
    if (!SSL)
        server = http.createServer(app);
    else
        server = https.createServer(
            {
                key: fs.readFileSync(DATA_PATH + "/ssl/key.pem"),
                cert: fs.readFileSync(DATA_PATH + "/ssl/cert.pem"),
            },
            app);

    await drizzler.promise;

    let port = SSL ? 443 : 3000;
    server.listen(port, () => {
        console.log(`listening on *:${port}`);
    });
})().then();