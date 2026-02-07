import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function listVehicles() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        const vehicles = await db.collection('vehicles').find({}).project({ brand: 1, model: 1, type: 1, slug: 1 }).toArray();

        console.log('--- Vehicles in DB ---');
        vehicles.forEach(v => {
            const computedSlug = `${v.brand}-${v.model}`.toLowerCase().replace(/\s+/g, '-');
            console.log(`Brand: "${v.brand}", Model: "${v.model}", Slug: "${v.slug || 'N/A'}", Computed: "${computedSlug}"`);
        });
        console.log('----------------------');

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

listVehicles();
