const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017"; // URL del servidor
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("Conectado a MongoDB");
        const db = client.db("data"); // Selecciona la base de datos
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

connectDB();
