import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function debugVehicles() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db();
        const vehiclesCollection = db.collection('vehicles');

        // Check specific vehicles
        const vehicles = await vehiclesCollection.find({
            $or: [
                { slug: 'bmw-g-310-gs' },
                { slug: 'bajaj-pulsar-220f' },
                { slug: 'bajaj-avenger-220' },
                { slug: 'kawasaki-ninja-400' }
            ]
        }).toArray();

        console.log('\n=== CHECKING VEHICLES IN DATABASE ===\n');

        vehicles.forEach(vehicle => {
            console.log(`\n${vehicle.brand} ${vehicle.model} (${vehicle.slug}):`);
            console.log(`  Images object exists: ${!!vehicle.images}`);
            if (vehicle.images) {
                console.log(`  Exterior images: ${vehicle.images.exterior?.length || 0}`);
                if (vehicle.images.exterior?.length > 0) {
                    console.log(`  First exterior URL: ${vehicle.images.exterior[0]}`);
                }
                console.log(`  Interior images: ${vehicle.images.interior?.length || 0}`);
                console.log(`  Colors: ${vehicle.images.colors?.length || 0}`);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

debugVehicles();
