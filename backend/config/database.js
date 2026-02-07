import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

/**
 * IMPORTANT:
 * - Database name is taken from the MongoDB URI itself
 * - Do NOT use DB_NAME separately
 * - URI must already include `/autoverse`
 */
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('❌ MONGO_URI is not defined in .env file');
}

let client;
let db;

/**
 * Connect to MongoDB
 */
export async function connectDB() {
  try {
    client = new MongoClient(MONGO_URI, {
      maxPoolSize: 10,
    });

    await client.connect();

    // Use DB name from URI
    db = client.db();
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${db.databaseName}`);
    console.log(`🌐 Host: ${client.options?.hosts?.[0] || 'Atlas Cluster'}`);

    await createIndexes();

    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️  Continuing without MongoDB - vehicle data will work via RapidAPI');
    console.warn('   Auth, saved vehicles, and leads require MongoDB');
    return null;
  }
}

/**
 * Create indexes for performance
 */
async function createIndexes() {
  try {
    if (!db) return;

    const vehicles = db.collection('vehicles');
    await vehicles.createIndex({ type: 1 });
    await vehicles.createIndex({ brand: 1 });
    await vehicles.createIndex({ slug: 1 }, { unique: true });
    await vehicles.createIndex({ price: 1 });
    await vehicles.createIndex({ rating: -1 });

    const users = db.collection('users');
    await users.createIndex({ phone: 1 }, { unique: true });

    const otps = db.collection('otps');
    await otps.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 });
    await otps.createIndex({ phone: 1 });

    const leads = db.collection('leads');
    await leads.createIndex({ createdAt: -1 });

    console.log('✅ Database indexes created');
  } catch (error) {
    console.warn('⚠️  Index creation warning:', error.message);
  }
}

/**
 * Get DB instance
 */
export function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}

/**
 * Close DB connection
 */
export async function closeDB() {
  if (client) {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

/**
 * Collection helpers
 */
export const collections = {
  vehicles: () => getDB().collection('vehicles'),
  users: () => getDB().collection('users'),
  otps: () => getDB().collection('otps'),
  leads: () => getDB().collection('leads'),
  showrooms: () => getDB().collection('showrooms'),
  reviews: () => getDB().collection('reviews'),
  savedVehicles: () => getDB().collection('saved_vehicles'),
  newsArticles: () => getDB().collection('news_articles'),
  comparisons: () => getDB().collection('comparisons'),
};

/**
 * Utility: serialize MongoDB docs
 */
export function serializeDoc(doc) {
  if (!doc) return null;

  if (Array.isArray(doc)) {
    return doc.map(serializeDoc);
  }

  const { _id, ...rest } = doc;
  return {
    id: _id?.toString(),
    ...rest,
  };
}

export { ObjectId };

export default {
  connectDB,
  getDB,
  closeDB,
  collections,
  serializeDoc,
  ObjectId,
};
