import CarWaleScraper from './scrapers/carwale.scraper.js';
import CarDekhoScraper from './scrapers/cardekho.scraper.js';
import BikeWaleScraper from './scrapers/bikewale.scraper.js';
import BikeDekhoScraper from './scrapers/bikedekho.scraper.js';
import LLMService from './llm.service.js';
import { collections } from '../config/database.js';

/**
 * Main Scraper Orchestrator
 * Coordinates all scrapers, processes data,  and saves to database
 */
class ScraperService {
    constructor() {
        this.scrapers = {
            carwale: new CarWaleScraper(),
            cardekho: new CarDekhoScraper(),
            bikewale: new BikeWaleScraper(),
            bikedekho: new BikeDekhoScraper()
        };
        this.llmService = new LLMService();
    }

    /**
     * Scrape all sources
     */
    async scrapeAll() {
        console.log('🚀 Starting full scrape from all sources...');

        const startTime = Date.now();
        const results = {
            cars: [],
            bikes: [],
            errors: []
        };

        try {
            // Scrape cars
            console.log('\n📱 Scraping cars from CarWale and CarDekho...');
            try {
                const carwaleCars = await this.scrapers.carwale.scrape();
                console.log(`✅ CarWale: ${carwaleCars.length} cars`);

                let cardekhoCars = [];
                try {
                    cardekhoCars = await this.scrapers.cardekho.scrape();
                    console.log(`✅ CarDekho: ${cardekhoCars.length} cars`);
                } catch (e) {
                    console.error(`❌ CarDekho failed: ${e.message}`);
                    results.errors.push({ source: 'cardekho', error: e.message });
                }

                results.cars = [...carwaleCars, ...cardekhoCars];
            } catch (error) {
                console.error(`❌ Car scraping error: ${error.message}`);
                results.errors.push({ source: 'cars', error: error.message });
            }

            // Scrape bikes
            console.log('\n🏍️  Scraping bikes from BikeWale and BikeDekho...');
            try {
                const bikewaleBikes = await this.scrapers.bikewale.scrape();
                console.log(`✅ BikeWale: ${bikewaleBikes.length} bikes`);

                let bikedekhoBikes = [];
                try {
                    bikedekhoBikes = await this.scrapers.bikedekho.scrape();
                    console.log(`✅ BikeDekho: ${bikedekhoBikes.length} bikes`);
                } catch (e) {
                    console.error(`❌ BikeDekho failed: ${e.message}`);
                    results.errors.push({ source: 'bikedekho', error: e.message });
                }

                results.bikes = [...bikewaleBikes, ...bikedekhoBikes];
            } catch (error) {
                console.error(`❌ Bike scraping error: ${error.message}`);
                results.errors.push({ source: 'bikes', error: error.message });
            }

            // Combine all vehicles
            const allVehicles = [...results.cars, ...results.bikes];
            console.log(`\n📊 Total vehicles scraped: ${allVehicles.length}`);

            // Process with LLM
            console.log('\n🤖 Processing vehicles with LLM...');
            const processedVehicles = await this.llmService.batchProcess(allVehicles);

            // Save to database
            console.log('\n💾 Saving to database...');
            await this.saveToDatabase(processedVehicles);

            const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
            console.log(`\n✅ Scraping complete in ${duration} minutes!`);
            console.log(`📈 Saved ${processedVehicles.length} vehicles to database`);

            // Log scraping session
            await this.logScrapingSession({
                status: 'success',
                vehicles_scraped: processedVehicles.length,
                duration_minutes: parseFloat(duration),
                errors: results.errors
            });

            return {
                success: true,
                vehicles: processedVehicles.length,
                duration: duration,
                errors: results.errors
            };

        } catch (error) {
            console.error(`❌ Fatal scraping error: ${error.message}`);

            await this.logScrapingSession({
                status: 'failed',
                vehicles_scraped: 0,
                errors: [{ source: 'system', error: error.message }]
            });

            throw error;
        }
    }

    /**
     * Scrape from specific source
     */
    async scrapeSource(sourceName) {
        console.log(`🎯 Scraping from ${sourceName}...`);

        if (!this.scrapers[sourceName]) {
            throw new Error(`Unknown scraper: ${sourceName}`);
        }

        try {
            const vehicles = await this.scrapers[sourceName].scrape();
            const processed = await this.llmService.batchProcess(vehicles);
            await this.saveToDatabase(processed);

            console.log(`✅ ${sourceName} scraping complete: ${processed.length} vehicles`);
            return processed;

        } catch (error) {
            console.error(`❌ ${sourceName} scraping failed:`, error.message);
            throw error;
        }
    }

    /**
     * Save vehicles to database
     */
    async saveToDatabase(vehicles) {
        if (!collections || !collections.vehicles) {
            console.warn('⚠️  Database not connected - vehicles not saved');
            return;
        }

        try {
            for (const vehicle of vehicles) {
                try {
                    // Upsert vehicle (update if exists, insert if new)
                    await collections.vehicles().updateOne(
                        { slug: vehicle.slug },
                        {
                            $set: {
                                ...vehicle,
                                last_updated: new Date()
                            },
                            $setOnInsert: {
                                created_at: new Date()
                            }
                        },
                        { upsert: true }
                    );
                } catch (error) {
                    console.error(`Error saving ${vehicle.brand} ${vehicle.model}:`, error.message);
                }
            }

            console.log(`✅ Saved ${vehicles.length} vehicles to database`);

        } catch (error) {
            console.error(`❌ Database save error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Log scraping session
     */
    async logScrapingSession(sessionData) {
        if (!collections || !collections.scraper_logs) {
            return;
        }

        try {
            await collections.scraper_logs().insertOne({
                ...sessionData,
                started_at: new Date(),
                completed_at: new Date()
            });
        } catch (error) {
            console.error('Error logging scraping session:', error.message);
        }
    }

    /**
     * Get scraping statistics
     */
    async getStats() {
        if (!collections || !collections.vehicles) {
            return { total: 0, cars: 0, bikes: 0 };
        }

        try {
            const total = await collections.vehicles().countDocuments();
            const cars = await collections.vehicles().countDocuments({ type: 'car' });
            const bikes = await collections.vehicles().countDocuments({ type: 'bike' });

            return { total, cars, bikes };

        } catch (error) {
            console.error('Error getting stats:', error.message);
            return { total: 0, cars: 0, bikes: 0 };
        }
    }
}

// Export singleton instance
const scraperService = new ScraperService();
export default scraperService;
