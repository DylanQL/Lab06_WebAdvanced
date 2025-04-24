const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function main() {
    await client.connect();
    const db = client.db('data');
    const collection = db.collection('clientes');

    const resultado = await collection.find().toArray();
    console.log(resultado);

    await client.close();
}

main();
