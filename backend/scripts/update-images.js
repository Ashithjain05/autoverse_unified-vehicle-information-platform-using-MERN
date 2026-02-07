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

/**
 * Update vehicle images in database using the image service
 */
async function updateVehicleImages() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();

        const db = client.db();
        console.log(`📊 Connected to database: ${db.databaseName}`);

        const vehiclesCollection = db.collection('vehicles');

        // Get all vehicles
        const vehicles = await vehiclesCollection.find({}).toArray();
        console.log(`📊 Found ${vehicles.length} vehicles in database`);

        if (vehicles.length === 0) {
            console.log('⚠️  No vehicles found in database. Please run the scraper first.');
            return;
        }

        let updated = 0;

        for (const vehicle of vehicles) {
            try {
                console.log(`\n🖼️  Updating images for: ${vehicle.brand} ${vehicle.model}`);

                // Fetch new images using the image service
                const newImages = await fetchVehicleImages({
                    brand: vehicle.brand,
                    model: vehicle.model,
                    type: vehicle.type
                });

                // Update the vehicle in database
                await vehiclesCollection.updateOne(
                    { _id: vehicle._id },
                    { $set: { images: newImages } }
                );

                updated++;
                console.log(`   ✅ Updated successfully`);

            } catch (error) {
                console.error(`   ❌ Error updating ${vehicle.brand} ${vehicle.model}:`, error.message);
            }
        }

        console.log(`\n✅ Updated ${updated} out of ${vehicles.length} vehicles`);

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the update
updateVehicleImages().catch(console.error);
