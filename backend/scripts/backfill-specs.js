import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function backfillSpecs() {
    const client = new MongoClient(MONGO_URI);
    try {
        await client.connect();
        const db = client.db();
        const vehicles = await db.collection('vehicles').find({}).toArray();

        console.log(`Checking ${vehicles.length} vehicles for missing specs...`);

        for (const v of vehicles) {
            const updates = {};
            const specs = v.specs || {};

            // Add standard defaults if missing
            if (!specs.fuel_tank_capacity) updates["specs.fuel_tank_capacity"] = "45 Liters";
            if (!specs.seat_height) updates["specs.seat_height"] = "765 mm";
            if (!specs.abs) updates["specs.abs"] = "Yes";
            if (!specs.transmission && specs.fuel_type !== 'Electric') updates["specs.transmission"] = "5-Speed Manual";
            if (!specs.transmission && specs.fuel_type === 'Electric') updates["specs.transmission"] = "Automatic";

            // Add Kerb Weight
            if (!specs.kerb_weight) {
                if (v.type === 'car' || (specs.engine && parseInt(specs.engine) > 800)) {
                    updates["specs.kerb_weight"] = "1150 kg";
                } else {
                    updates["specs.kerb_weight"] = "140 kg";
                }
            }

            if (Object.keys(updates).length > 0) {
                await db.collection('vehicles').updateOne(
                    { _id: v._id },
                    { $set: updates }
                );
                console.log(`Updated ${v.brand} ${v.model}`);
            }
        }

        console.log('Backfill complete.');

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

backfillSpecs();
