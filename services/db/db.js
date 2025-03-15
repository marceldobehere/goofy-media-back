const dbProm = require('./db_internal')
const goofyDb = require('./drizzle/drizzle')
const { Test } = require('./drizzle/schema')
const { eq } = require('drizzle-orm');

async function testDrizzleBasics() {
    console.log("> Testing drizzle basics");

    const result1 = await goofyDb.select()
        .from(Test);
    console.log(result1);

    const result2 = await goofyDb.insert(Test)
        .values({test: "ABC 123"});
    console.log(result2);

    const result3 = await goofyDb.select()
        .from(Test);
    console.log(result3);

    const result4 = await goofyDb.delete(Test)
        .where(eq(Test.test, "ABC 123"));
    console.log(result4);

    const result5 = await goofyDb.select()
        .from(Test);
    console.log(result5);
}

async function testBasics() {
    console.log("> Testing basics");
    // create table (if not exists)
    // query table
    // write test data
    // query table again
    // delete test data
    // query table again
    const db = await dbProm;

    // create table (if not exists)
    if (!db.listCollections({ name: 'test' })) {
        await db.createCollection('test');
    }

    // query table
    const collection = db.collection('test');
    const query = { name: 'test' };
    const result = await collection
        .find(query)
        .toArray();
    console.log(result);

    // write test data
    const doc = { name: 'test' };
    await collection.insertOne(doc);

    // query table again
    const result2 = await collection
        .find(query)
        .toArray();
    console.log(result2);

    // delete test data
    await collection.deleteOne(query);

    // query table again
    const result3 = await collection
        .find(query)
        .toArray();
    console.log(result3);
}
// testBasics().then(testDrizzleBasics);