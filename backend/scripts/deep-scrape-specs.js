import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env file');
    process.exit(1);
}

// Helper to reliably construct URL from vehicle data
function getVehicleUrl(vehicle) {
    const brandSlug = vehicle.brand.toLowerCase().replace(/\s+/g, '-');
    // Model slug is tricky. If vehicle.slug is 'maruti-suzuki-swift', and brand is 'maruti-suzuki', model is 'swift'.
    // If vehicle.slug is 'royal-enfield-classic-350', brand 'royal-enfield', model 'classic-350'.
    const modelSlug = vehicle.slug.replace(`${brandSlug}-`, '');

    if (vehicle.type === 'bike') {
        // BikeWale: https://www.bikewale.com/royalenfield-bikes/classic-350/
        // Exception: Royal Enfield slug in BikeWale is usually 'royalenfield' (no hyphen)?
        // Let's handle special brands
        let bikeBrandSlug = brandSlug;
        if (bikeBrandSlug === 'royal-enfield') bikeBrandSlug = 'royalenfield';
        if (bikeBrandSlug === 'hero-electric') bikeBrandSlug = 'heroelectric';

        return `https://www.bikewale.com/${bikeBrandSlug}-bikes/${modelSlug}/`;
    } else {
        // CarWale: https://www.carwale.com/maruti-suzuki-cars/swift/
        return `https://www.carwale.com/${brandSlug}-cars/${modelSlug}/`;
    }
}

async function deepScrapeSpecs() {
    const client = new MongoClient(MONGO_URI);

    try {
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        const db = client.db();
        const vehiclesCollection = db.collection('vehicles');

        // Find vehicles with missing specs (targeting "N/A" specifically)
        const vehicles = await vehiclesCollection.find({
            $or: [
                { 'specs.kerb_weight': 'N/A' },
                { 'specs.fuel_tank_capacity': 'N/A' }
            ]
        }).toArray();

        console.log(`📊 Found ${vehicles.length} vehicles to refine...`);

        let updatedCount = 0;

        for (const vehicle of vehicles) {
            const url = getVehicleUrl(vehicle);
            console.log(`\n🔍 Scraping ${vehicle.brand} ${vehicle.model}...`);
            console.log(`   URL: ${url}`);

            try {
                const { data } = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    timeout: 10000
                });

                const $ = cheerio.load(data);
                const newSpecs = { ...vehicle.specs };
                let foundAny = false;

                // --- Parsing Logic ---

                // Helper to find text in table cells
                const findTextInTable = (keywords) => {
                    let value = null;
                    // Look for td/th containing keyword
                    $('td, th, span, div, li').each((i, el) => {
                        if (value) return; // Found already
                        const text = $(el).text().trim().toLowerCase();
                        if (keywords.some(k => text.includes(k))) {
                            // Value is usually in the next sibling or children
                            // Case 1: <td>Key</td><td>Value</td>
                            let next = $(el).next().text().trim();
                            if (next) { value = next; return; }

                            // Case 2: <li>Key <span>Value</span></li>
                            let child = $(el).find('span').last().text().trim(); // last span often has value
                            if (child && child !== text) { value = child; return; }

                            // Case 3: Parent's text (if smashed)
                            // "Kerb Weight 195 kg"
                            // Regex check
                        }
                    });
                    return value;
                };

                // Robust Regex Search on entire body text (fallback)
                const bodyText = $('body').text().replace(/\s+/g, ' ');

                // 1. Kerb Weight
                if (newSpecs.kerb_weight === 'N/A') {
                    const match = bodyText.match(/Kerb Weight\s*[:\-\s]?\s*(\d+(\.\d+)?)\s*kg/i) ||
                        bodyText.match(/Weight\s*[:\-\s]?\s*(\d+(\.\d+)?)\s*kg/i);
                    if (match) {
                        newSpecs.kerb_weight = `${match[1]} kg`;
                        foundAny = true;
                        console.log(`   ✅ Found Kerb Weight: ${newSpecs.kerb_weight}`);
                    }
                }

                // 2. Fuel Tank
                if (newSpecs.fuel_tank_capacity === 'N/A') {
                    const match = bodyText.match(/Fuel Tank Capacity\s*[:\-\s]?\s*(\d+(\.\d+)?)\s*Liter/i) ||
                        bodyText.match(/Fuel Tank\s*[:\-\s]?\s*(\d+(\.\d+)?)\s*L/i) ||
                        bodyText.match(/capacity\s*[:\-\s]?\s*(\d+(\.\d+)?)\s*L/i);
                    if (match) {
                        newSpecs.fuel_tank_capacity = `${match[1]} Liters`;
                        foundAny = true;
                        console.log(`   ✅ Found Fuel Tank: ${newSpecs.fuel_tank_capacity}`);
                    }
                }

                // 3. Seat Height (Bikes)
                if (vehicle.type === 'bike' && newSpecs.seat_height === 'N/A') {
                    const match = bodyText.match(/Seat Height\s*[:\-\s]?\s*(\d+)\s*mm/i) ||
                        bodyText.match(/Saddle Height\s*[:\-\s]?\s*(\d+)\s*mm/i);
                    if (match) {
                        newSpecs.seat_height = `${match[1]} mm`;
                        foundAny = true;
                        console.log(`   ✅ Found Seat Height: ${newSpecs.seat_height}`);
                    }
                }

                // 4. ABS
                if (newSpecs.abs === 'N/A') {
                    if (bodyText.match(/Dual Channel ABS/i) || bodyText.match(/Dual-Channel ABS/i)) {
                        newSpecs.abs = "Dual Channel";
                        foundAny = true;
                    } else if (bodyText.match(/Single Channel ABS/i)) {
                        newSpecs.abs = "Single Channel";
                        foundAny = true;
                    } else if (bodyText.match(/ABS\s*[:\-\s]?\s*Yes/i) || bodyText.match(/with ABS/i)) {
                        newSpecs.abs = "Yes";
                        foundAny = true;
                    }
                    if (foundAny && newSpecs.abs !== 'N/A') console.log(`   ✅ Found ABS: ${newSpecs.abs}`);
                }

                if (foundAny) {
                    await vehiclesCollection.updateOne(
                        { _id: vehicle._id },
                        { $set: { specs: newSpecs } }
                    );
                    updatedCount++;
                } else {
                    console.log('   ⚠️  No new specs found on page.');
                }

                // Delay to be polite
                await new Promise(r => setTimeout(r, 1500));

            } catch (err) {
                console.error(`   ❌ Failed: ${err.message}`);
                // Continue to next vehicle
            }
        }

        console.log(`\n🎉 Deep scraping complete! Updated ${updatedCount} vehicles.`);

    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await client.close();
    }
}

deepScrapeSpecs();
