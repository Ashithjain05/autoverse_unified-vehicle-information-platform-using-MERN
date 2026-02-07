import BaseScraper from './base.scraper.js';
import * as cheerio from 'cheerio';

/**
 * BikeWale Scraper
 * Scrapes bike data from BikeWale.com
 */
class BikeWaleScraper extends BaseScraper {
    constructor() {
        super({
            name: 'BikeWale',
            baseUrl: 'https://www.bikewale.com',
            rateLimit: 3000 // 3 seconds between requests
        });
    }

    /**
     * Scrape popular bikes
     */
    async scrape() {
        try {
            this.log('Starting BikeWale scrape...');

            const vehicles = [];

            // Get popular bike brands
            const brands = await this.getPopularBrands();
            this.log(`Found ${brands.length} brands`);

            // Scrape top models from each brand
            for (const brand of brands.slice(0, 10)) { // Limit to top 10 brands
                try {
                    const brandVehicles = await this.scrapeBrand(brand);
                    vehicles.push(...brandVehicles);
                    this.log(`Scraped ${brandVehicles.length} bikes from ${brand.name}`);
                } catch (error) {
                    this.log(`Error scraping brand ${brand.name}: ${error.message}`);
                }
            }

            this.log(`Total bikes scraped: ${vehicles.length}`);
            return vehicles;

        } catch (error) {
            this.log(`Fatal error during scrape: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get list of popular brands
     */
    async getPopularBrands() {
        // Popular Indian bike brands
        return [
            { name: 'Royal Enfield', slug: 'royalenfield' },
            { name: 'Hero', slug: 'hero' },
            { name: 'Honda', slug: 'honda' },
            { name: 'Bajaj', slug: 'bajaj' },
            { name: 'TVS', slug: 'tvs' },
            { name: 'Suzuki', slug: 'suzuki' },
            { name: 'Yamaha', slug: 'yamaha' },
            { name: 'KTM', slug: 'ktm' },
            { name: 'Kawasaki', slug: 'kawasaki' },
            { name: 'Harley Davidson', slug: 'harley-davidson' }
        ];
    }

    /**
     * Scrape vehicles from a specific brand
     */
    async scrapeBrand(brand) {
        try {
            const url = `${this.baseUrl}/${brand.slug}-bikes/`;
            const html = await this.fetch(url);
            const $ = cheerio.load(html);

            const vehicles = [];

            // Parse bike cards
            $('.o-fqVqCM, .bikeList').slice(0, 5).each((i, elem) => {
                try {
                    const vehicle = this.parseBikeCard($, elem, brand);
                    if (vehicle) {
                        vehicles.push(vehicle);
                    }
                } catch (error) {
                    this.log(`Error parsing bike card: ${error.message}`);
                }
            });

            return vehicles;

        } catch (error) {
            this.log(`Error scraping brand ${brand.name}: ${error.message}`);
            return [];
        }
    }

    /**
     * Parse individual bike card
     */
    parseBikeCard($, elem, brand) {
        const $card = $(elem);

        const model = $card.find('.o-bXKmQE, .bikeName').text().trim();
        const priceText = $card.find('.o-bqHweY, .bikePrice').text().trim();
        const price = this.parsePrice(priceText);

        if (!model || !price) {
            return null;
        }

        return {
            type: 'bike',
            brand: brand.name,
            model: model,
            slug: `${brand.slug}-${model.toLowerCase().replace(/\s+/g, '-')}`,
            price: price,
            year: new Date().getFullYear(),
            variants: [{
                name: 'Standard',
                price: price,
                ex_showroom_price: price
            }],
            specs: {
                fuel_type: 'Petrol',
                transmission: 'Manual',
                seating_capacity: 2,
                engine_type: this.extractEngineType($card),
                kerb_weight: 'N/A',
                fuel_tank_capacity: 'N/A',
                seat_height: 'N/A',
                abs: 'N/A'
            },
            images: this.extractImages($card),
            scraped_from: 'bikewale',
            last_scraped: new Date()
        };
    }

    /**
     * Parse price from text
     */
    parsePrice(priceText) {
        if (!priceText) return null;

        // Remove currency symbols and "onwards"
        const cleaned = priceText.replace(/[₹,]/g, '').replace(/onwards/i, '').trim();

        // Handle Lakh
        if (cleaned.includes('Lakh')) {
            const value = parseFloat(cleaned.replace('Lakh', '').trim());
            return Math.round(value * 100000);
        }

        // Try to parse direct number
        const directValue = parseFloat(cleaned);
        if (!isNaN(directValue) && directValue > 10000) {
            return Math.round(directValue);
        }

        return null;
    }

    /**
     * Extract engine type from card
     */
    extractEngineType($card) {
        const text = $card.text().toLowerCase();
        if (text.includes('cc')) {
            const match = text.match(/(\d+)\s*cc/);
            if (match) {
                return `${match[1]}cc`;
            }
        }
        return null;
    }

    /**
     * Extract images from card
     */
    extractImages($card) {
        const images = [];
        $card.find('img').each((i, img) => {
            const src = $(img).attr('src') || $(img).attr('data-src');
            if (src && !src.includes('placeholder') && !src.includes('logo')) {
                images.push(src);
            }
        });
        return images.slice(0, 3); // Max 3 images
    }
}

export default BikeWaleScraper;
