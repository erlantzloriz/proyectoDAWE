import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGO_DB_NAME || 'tienda';
const client = new MongoClient(MONGO_URI);

let db;

export async function conectarDB() {
  if (db) return db;
  try {
    await client.connect();
    db = client.db(DB_NAME);
    console.log('🔌 Conexión con MongoDB establecida con éxito');
    return db;
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error);
    throw error;
  }
}

export function getDB() {
  if (!db) {
    throw new Error('La base de datos no ha sido inicializada. Llama primero a conectarDB().');
  }
  return db;
}