import BaseScraper from './base.scraper.js';
import * as cheerio from 'cheerio';

/**
 * CarWale Scraper
 * Scrapes car data from CarWale.com
 */
class CarWaleScraper extends BaseScraper {
    constructor() {
        super({
            name: 'CarWale',
            baseUrl: 'https://www.carwale.com',
            rateLimit: 5000 // 5 seconds between requests for safety
        });
    }

    /**
     * Scrape popular cars
     */
    async scrape() {
        try {
            this.log('Starting CarWale scrape...');

            const vehicles = [];

            // Get popular car brands
            const brands = await this.getPopularBrands();
            this.log(`Found ${brands.length} brands`);

            // Scrape top models from each brand (limit to avoid long scraping times)
            for (const brand of brands.slice(0, 10)) { // Limit to top 10 brands
                try {
                    const brandVehicles = await this.scrapeBrand(brand);
                    vehicles.push(...brandVehicles);
                    this.log(`Scraped ${brandVehicles.length} vehicles from ${brand.name}`);
                } catch (error) {
                    this.log(`Error scraping brand ${brand.name}: ${error.message}`);
                }
            }

            this.log(`Total vehicles scraped: ${vehicles.length}`);
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
        // Popular Indian car brands
        return [
            { name: 'Maruti Suzuki', slug: 'maruti-suzuki' },
            { name: 'Hyundai', slug: 'hyundai' },
            { name: 'Tata', slug: 'tata' },
            { name: 'Mahindra', slug: 'mahindra' },
            { name: 'Kia', slug: 'kia' },
            { name: 'Honda', slug: 'honda' },
            { name: 'Toyota', slug: 'toyota' },
            { name: 'Renault', slug: 'renault' },
            { name: 'Nissan', slug: 'nissan' },
            { name: 'MG', slug: 'mg' }
        ];
    }

    /**
     * Scrape vehicles from a specific brand
     */
    async scrapeBrand(brand) {
        try {
            const url = `${this.baseUrl}/${brand.slug}-cars/`;
            const html = await this.fetch(url);
            const $ = cheerio.load(html);

            const vehicles = [];

            // Parse vehicle cards (limiting to top models)
            $('.o-fqVqCM').slice(0, 5).each((i, elem) => {
                try {
                    const vehicle = this.parseVehicleCard($, elem, brand);
                    if (vehicle) {
                        vehicles.push(vehicle);
                    }
                } catch (error) {
                    this.log(`Error parsing vehicle card: ${error.message}`);
                }
            });

            return vehicles;

        } catch (error) {
            this.log(`Error scraping brand ${brand.name}: ${error.message}`);
            return [];
        }
    }

    /**
     * Parse individual vehicle card
     */
    parseVehicleCard($, elem, brand) {
        const $card = $(elem);

        const model = $card.find('.o-bXKmQE').text().trim();
        const priceText = $card.find('.o-bqHweY').text().trim();
        const price = this.parsePrice(priceText);

        if (!model || !price) {
            return null;
        }

        return {
            type: 'car',
            brand: brand.name,
            model: model,
            slug: `${brand.slug}-${model.toLowerCase().replace(/\s+/g, '-')}`,
            price: price,
            year: new Date().getFullYear(),
            variants: [{
                name: 'Base',
                price: price,
                ex_showroom_price: price
            }],
            specs: {
                fuel_type: this.extractFuelType($card),
                transmission: 'Manual',
                seating_capacity: 5,
                kerb_weight: 'N/A',
                fuel_tank_capacity: 'N/A',
                abs: 'N/A'
            },
            images: this.extractImages($card),
            scraped_from: 'carwale',
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

        // Handle Lakh and Crore
        if (cleaned.includes('Lakh')) {
            const value = parseFloat(cleaned.replace('Lakh', '').trim());
            return Math.round(value * 100000);
        } else if (cleaned.includes('Cr')) {
            const value = parseFloat(cleaned.replace('Cr', '').trim());
            return Math.round(value * 10000000);
        }

        return null;
    }

    /**
     * Extract fuel type from card
     */
    extractFuelType($card) {
        const text = $card.text().toLowerCase();
        if (text.includes('petrol') || text.includes('gasoline')) return 'Petrol';
        if (text.includes('diesel')) return 'Diesel';
        if (text.includes('electric') || text.includes('ev')) return 'Electric';
        if (text.includes('hybrid')) return 'Hybrid';
        if (text.includes('cng')) return 'CNG';
        return 'Petrol';
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

export default CarWaleScraper;
