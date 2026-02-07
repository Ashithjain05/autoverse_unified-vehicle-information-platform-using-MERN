import BaseScraper from './base.scraper.js';
import * as cheerio from 'cheerio';

/**
 * CarDekho Scraper
 * Scrapes car data from CarDekho.com
 */
class CarDekhoScraper extends BaseScraper {
    constructor() {
        super({
            name: 'CarDekho',
            baseUrl: 'https://www.cardekho.com',
            rateLimit: 3000 // 3 seconds between requests
        });
    }

    /**
     * Scrape popular cars
     */
    async scrape() {
        try {
            this.log('Starting CarDekho scrape...');
            const vehicles = [];

            // Get popular/new cars from homepage or specific section
            // For CarDekho, we can look at "New Cars" or "Popular" sections
            const popularCarsUrl = `${this.baseUrl}/new-cars`;

            const html = await this.fetch(popularCarsUrl);
            const $ = cheerio.load(html);

            // CarDekho structure often lists brands or specific popular models
            // We'll scrape brands first to get a good coverage similar to CarWale scraper
            const brands = await this.getPopularBrands();

            for (const brand of brands.slice(0, 10)) { // Limit to top 10
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

    async getPopularBrands() {
        return [
            { name: 'Maruti Suzuki', slug: 'maruti-suzuki' },
            { name: 'Hyundai', slug: 'hyundai' },
            { name: 'Tata', slug: 'tata' },
            { name: 'Mahindra', slug: 'mahindra' },
            { name: 'Kia', slug: 'kia' },
            { name: 'Toyota', slug: 'toyota' },
            { name: 'Honda', slug: 'honda' },
            { name: 'MG', slug: 'mg-motor' }
        ];
    }

    async scrapeBrand(brand) {
        try {
            const url = `${this.baseUrl}/${brand.slug}-cars`;
            const html = await this.fetch(url);
            const $ = cheerio.load(html);

            const vehicles = [];

            // Select vehicle cards - Note: Selectors need to be robust or updated based on actual site
            // CarDekho cards often have class like 'gsc_col-sm-12' or specific data attributes
            // Using generic structure assumption for robust fallback or specific known classes

            // Example selector for car cards in a list
            $('.NewCarList .gsc_col-sm-12, .gsc_col-md-12 li').slice(0, 5).each((i, elem) => {
                const vehicle = this.parseVehicleCard($, elem, brand);
                if (vehicle) vehicles.push(vehicle);
            });

            return vehicles;
        } catch (error) {
            this.log(`Error scraping brand ${brand.name}: ${error.message}`);
            return [];
        }
    }

    parseVehicleCard($, elem, brand) {
        const $card = $(elem);

        // Selectors - these are hypothetical and need adjustment if site structure changes
        // Assuming a standard title/price structure
        const model = $card.find('h3 a').text().trim() || $card.find('.title').text().trim();
        const priceText = $card.find('.price, .gsc_price').text().trim();

        if (!model || !priceText) return null;

        const price = this.parsePrice(priceText);
        const images = [];
        $card.find('img').each((i, img) => {
            const src = $(img).attr('src') || $(img).attr('data-original');
            if (src && src.startsWith('http')) images.push(src);
        });

        // Basic specs if available on card
        const fuelType = $card.find('.dotlist span').first().text().trim() || 'Petrol';

        return {
            type: 'car',
            brand: brand.name,
            model: model,
            slug: `${brand.name}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            price: price || 0,
            year: new Date().getFullYear(),
            variants: [{
                name: 'Standard',
                price: price || 0,
                ex_showroom_price: price || 0
            }],
            specs: {
                fuel_type: fuelType,
                transmission: 'Manual', // Default fallback
                seating_capacity: 5
            },
            images: images.slice(0, 3), // Top 3 images
            scraped_from: 'cardekho',
            last_scraped: new Date()
        };
    }

    parsePrice(priceText) {
        if (!priceText) return 0;
        // Clean "Rs. 5.00 - 9.00 Lakh" to base number
        const clean = priceText.replace(/[^0-9.]/g, ' ').trim().split(' ')[0];
        const val = parseFloat(clean);

        if (priceText.includes('Cr')) return Math.round(val * 10000000);
        if (priceText.includes('Lakh')) return Math.round(val * 100000);
        return Math.round(val);
    }
}

export default CarDekhoScraper;
