import { collections, connectDB } from '../config/database.js';

async function inspectVehicles() {
    try {
        await connectDB();

        console.log('Connected to database. Fetching a few vehicles...');
        const vehicles = await collections.vehicles().find({}).limit(5).toArray();

        if (vehicles.length === 0) {
            console.log('No vehicles found in database.');
            return;
        }

        vehicles.forEach((v, index) => {
            console.log(`\n--- Vehicle ${index + 1}: ${v.brand} ${v.model} ---`);
            console.log('Fuel Type (root):', v.fuelType);
            console.log('Fuel Type (root snake_case):', v.fuel_type);
            console.log('Specs:', JSON.stringify(v.specs, null, 2));

            // Check keys in specs if they exist
            if (v.specs) {
                console.log('Keys in specs:', Object.keys(v.specs));
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

inspectVehicles();
