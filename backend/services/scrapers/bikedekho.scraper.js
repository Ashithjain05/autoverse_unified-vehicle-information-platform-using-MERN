import BaseScraper from './base.scraper.js';
import * as cheerio from 'cheerio';

/**
 * BikeDekho Scraper
 * Scrapes bike data from BikeDekho.com
 */
class BikeDekhoScraper extends BaseScraper {
    constructor() {
        super({
            name: 'BikeDekho',
            baseUrl: 'https://www.bikedekho.com',
            rateLimit: 3000 // 3 seconds between requests
        });
    }

    /**
     * Scrape popular bikes
     */
    async scrape() {
        try {
            this.log('Starting BikeDekho scrape...');
            const vehicles = [];

            // Get popular/new bikes
            // Similar strategy to CarDekho, scraping from popular brands
            const brands = await this.getPopularBrands();

            for (const brand of brands.slice(0, 10)) {
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
            { name: 'Hero', slug: 'hero' },
            { name: 'Honda', slug: 'honda' },
            { name: 'TVS', slug: 'tvs' },
            { name: 'Bajaj', slug: 'bajaj' },
            { name: 'Royal Enfield', slug: 'royal-enfield' },
            { name: 'Yamaha', slug: 'yamaha' },
            { name: 'Suzuki', slug: 'suzuki' },
            { name: 'KTM', slug: 'ktm' }
        ];
    }

    async scrapeBrand(brand) {
        try {
            const url = `${this.baseUrl}/${brand.slug}-bikes`;
            const html = await this.fetch(url);
            const $ = cheerio.load(html);

            const vehicles = [];

            // Selector strategy for BikeDekho (similar to CarDekho)
            $('.BikeList .gsc_col-sm-12, .gsc_col-md-12 li').slice(0, 5).each((i, elem) => {
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

        const model = $card.find('h3 a').text().trim() || $card.find('.title').text().trim();
        const priceText = $card.find('.price, .gsc_price').text().trim();

        if (!model || !priceText) return null;

        const price = this.parsePrice(priceText);
        const images = [];
        $card.find('img').each((i, img) => {
            const src = $(img).attr('src') || $(img).attr('data-original');
            if (src && src.startsWith('http')) images.push(src);
        });

        return {
            type: 'bike',
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
                fuel_type: 'Petrol', // Most bikes are petrol
                transmission: 'Manual',
                seating_capacity: 2
            },
            images: images.slice(0, 3),
            scraped_from: 'bikedekho',
            last_scraped: new Date()
        };
    }

    parsePrice(priceText) {
        if (!priceText) return 0;
        const clean = priceText.replace(/[^0-9.]/g, ' ').trim().split(' ')[0];
        const val = parseFloat(clean);

        if (priceText.includes('Lakh')) return Math.round(val * 100000);
        return Math.round(val); // Assuming raw number if no unit
    }
}

export default BikeDekhoScraper;
