import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import LLMService from '../services/llm.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env file');
    process.exit(1);
}

async function refreshSpecsWithAI() {
    const client = new MongoClient(MONGO_URI);
    const llmService = new LLMService();

    if (!llmService.enabled) {
        console.error('❌ OpenAI API Key not configured. Cannot generate realtime specs.');
        console.log('Please add OPENAI_API_KEY to backend/.env');
        process.exit(1);
    }

    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        const db = client.db();
        const vehiclesCollection = db.collection('vehicles');

        // Fetch all vehicles
        const vehicles = await vehiclesCollection.find({}).toArray();
        console.log(`📊 Found ${vehicles.length} vehicles to process...`);

        let successCount = 0;

        // Process in batches of 5 to avoid rate limits
        const BATCH_SIZE = 5;
        for (let i = 0; i < vehicles.length; i += BATCH_SIZE) {
            const batch = vehicles.slice(i, i + BATCH_SIZE);
            console.log(`\n🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(vehicles.length / BATCH_SIZE)}...`);

            const promises = batch.map(async (vehicle) => {
                try {
                    // Force refresh of specs by calling LLM service
                    // The LLM service is now configured to ask for kerb_weight, fuel_tank, etc.
                    const processed = await llmService.processVehicle(vehicle);

                    // Update database
                    await vehiclesCollection.updateOne(
                        { _id: vehicle._id },
                        {
                            $set: {
                                specs: processed.specs,
                                pros_cons: processed.pros_cons, // Refresh these too while we're at it
                                last_updated: new Date()
                            }
                        }
                    );

                    process.stdout.write('.'); // Progress dot
                    return true;
                } catch (err) {
                    console.error(`\n❌ Failed to process ${vehicle.brand} ${vehicle.model}: ${err.message}`);
                    return false;
                }
            });

            const results = await Promise.all(promises);
            successCount += results.filter(r => r).length;

            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`\n\n🎉 Spec refresh complete!`);
        console.log(`✅ Successfully updated ${successCount}/${vehicles.length} vehicles with AI-generated specs.`);

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await client.close();
        console.log('🔌 Disconnected from MongoDB');
    }
}

refreshSpecsWithAI();
