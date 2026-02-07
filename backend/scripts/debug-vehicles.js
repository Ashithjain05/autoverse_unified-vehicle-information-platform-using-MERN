import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to valid .env location
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env file');
    process.exit(1);
}

async function listVehicles() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db();
        const vehicles = await db.collection('vehicles').find({}).toArray();

        console.log(`Found ${vehicles.length} vehicles.`);
        vehicles.forEach(v => {
            if (v.model.includes('Sonet') || v.model.includes('Innova') || v.model.includes('Urban') || v.model.includes('A4')) {
                const slug = `${v.brand}-${v.model}`.toLowerCase().replace(/\s+/g, '-');
                console.log(`Brand: "${v.brand}", Model: "${v.model}", Slug: "${slug}"`);
            }
        });

    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

listVehicles();
