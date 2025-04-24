require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
const client = new MongoClient(uri);

async function listarProductos() {  try {
    await client.connect();
    console.log("Conectado a MongoDB");
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Obtener todos los documentos
    const productos = await collection.find().toArray();
    console.log("Listado de productos:", productos);
  } catch (error) {
    console.error("Error de conexión a MongoDB:", error.message);
    console.error("Verifica que MongoDB esté instalado y ejecutándose en el puerto 27017");
  } finally {
    await client.close();
    console.log("Conexión cerrada");
  }
}

listarProductos();
