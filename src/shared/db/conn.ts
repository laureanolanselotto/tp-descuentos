import { MongoClient, Db } from "mongodb";
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de conexión
const connectionString = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/tp-descuentos";
const databaseName = process.env.MONGO_DB_NAME || "tp-descuentos";

console.log(`🔌 Conectando a MongoDB: ${connectionString}`);
console.log(`📂 Base de datos: ${databaseName}`);

const client = new MongoClient(connectionString);

// Variable para almacenar la conexión
let db: Db | null = null;

// Función para conectar a la base de datos
export async function connectToDatabase(): Promise<Db> {
    if (db) {
        return db;
    }
    
    try {
        await client.connect();
        db = client.db(databaseName);
        console.log("✅ Conectado exitosamente a MongoDB");
        return db;
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error);
        throw error;
    }
}

// Función para obtener la base de datos (conecta si es necesario)
export async function getDatabase(): Promise<Db> {
    if (!db) {
        return await connectToDatabase();
    }
    return db;
}

// Función para cerrar la conexión cuando sea necesario
export async function closeConnection() {
    if (client) {
        await client.close();
        db = null;
        console.log("🔌 Conexión a MongoDB cerrada");
    }
}