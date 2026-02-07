
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function checkBrandStats() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        const collection = db.collection('vehicles');

        const carStats = await collection.aggregate([
            { $match: { type: 'car' } },
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();

        const bikeStats = await collection.aggregate([
            { $match: { type: 'bike' } },
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();

        console.log('Car Stats:', carStats);
        console.log('Bike Stats:', bikeStats);

        // Also check raw count
        const total = await collection.countDocuments();
        console.log('Total Vehicles:', total);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

checkBrandStats();
