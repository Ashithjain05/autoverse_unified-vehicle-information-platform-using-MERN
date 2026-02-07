import { MongoClient } from 'mongodb';
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

async function enrichSpecs() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        const db = client.db();
        const vehiclesCollection = db.collection('vehicles');

        console.log('📊 Starting spec enrichment...');

        // 1. Add Kerb Weight (All vehicles)
        const res1 = await vehiclesCollection.updateMany(
            { 'specs.kerb_weight': { $exists: false } },
            { $set: { 'specs.kerb_weight': 'N/A' } }
        );
        console.log(`✅ Added kerb_weight to ${res1.modifiedCount} vehicles`);

        // 2. Add Fuel Tank Capacity (All vehicles)
        const res2 = await vehiclesCollection.updateMany(
            { 'specs.fuel_tank_capacity': { $exists: false } },
            { $set: { 'specs.fuel_tank_capacity': 'N/A' } }
        );
        console.log(`✅ Added fuel_tank_capacity to ${res2.modifiedCount} vehicles`);

        // 3. Add ABS (All vehicles)
        const res3 = await vehiclesCollection.updateMany(
            { 'specs.abs': { $exists: false } },
            { $set: { 'specs.abs': 'N/A' } }
        );
        console.log(`✅ Added abs to ${res3.modifiedCount} vehicles`);

        // 4. Add Seat Height (Bikes only)
        const res4 = await vehiclesCollection.updateMany(
            { type: 'bike', 'specs.seat_height': { $exists: false } },
            { $set: { 'specs.seat_height': 'N/A' } }
        );
        console.log(`✅ Added seat_height to ${res4.modifiedCount} bikes`);

        console.log('\n🎉 Spec enrichment complete!');

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

enrichSpecs();
