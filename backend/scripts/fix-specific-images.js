import { MongoClient } from 'mongodb';
import { fetchVehicleImages } from '../services/image.service.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env file');
    process.exit(1);
}

// Updated target list for Avenger and Ninja
const TARGET_VEHICLES = [
    { brand: 'KTM', model: 'RC 200', type: 'bike' }
];

async function fixSpecificImages() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        const db = client.db();
        const vehiclesCollection = db.collection('vehicles');

        for (const target of TARGET_VEHICLES) {
            console.log(`\n🔍 Searching for ${target.brand} ${target.model}...`);

            // Case-insensitive search
            const vehicle = await vehiclesCollection.findOne({
                brand: { $regex: new RegExp(`^${target.brand}$`, 'i') },
                model: { $regex: new RegExp(`^${target.model}$`, 'i') }
            });

            if (!vehicle) {
                console.log(`❌ Vehicle not found in DB: ${target.brand} ${target.model}`);
                continue;
            }

            console.log(`✅ Found vehicle: ${vehicle.brand} ${vehicle.model} (ID: ${vehicle._id})`);
            console.log(`🖼️  Fetching correct images...`);

            const newImages = await fetchVehicleImages({
                brand: vehicle.brand,
                model: vehicle.model,
                type: target.type
            });

            const result = await vehiclesCollection.updateOne(
                { _id: vehicle._id },
                { $set: { images: newImages } }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ Update SUCCESS: Saved new images for ${target.brand} ${target.model}`);
            } else {
                console.log(`⚠️  No changes made (images might be identical already)`);
            }
        }

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

fixSpecificImages();
