const dbProm = require('./db_internal')

async function testBasics() {
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
testBasics();