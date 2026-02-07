import axios from 'axios';

/**
 * Base Scraper Class
 * All site-specific scrapers extend this class
 */
class BaseScraper {
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.name = config.name;
        this.rateLimit = config.rateLimit || 2000; // 2 seconds between requests
        this.maxRetries = config.maxRetries || 3;
        this.timeout = config.timeout || 30000; // 30 seconds
        this.lastRequestTime = 0;

        // User agents to rotate
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ];
    }

    /**
     * Get random user agent
     */
    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    /**
     * Implement rate limiting
     */
    async respectRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.rateLimit) {
            const waitTime = this.rateLimit - timeSinceLastRequest;
            console.log(`⏱️  Rate limiting: waiting ${waitTime}ms`);
            await this.sleep(waitTime);
        }

        this.lastRequestTime = Date.now();
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fetch URL with retry logic
     */
    async fetch(url, options = {}) {
        await this.respectRateLimit();

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🌐 Fetching: ${url} (attempt ${attempt}/${this.maxRetries})`);

                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': this.getRandomUserAgent(),
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept-Encoding': 'gzip, deflate',
                        'Connection': 'keep-alive',
                        ...options.headers
                    },
                    timeout: this.timeout,
                    ...options
                });

                console.log(`✅ Successfully fetched: ${url}`);
                return response.data;

            } catch (error) {
                console.error(`❌ Attempt ${attempt} failed for ${url}:`, error.message);

                if (attempt === this.maxRetries) {
                    throw new Error(`Failed to fetch ${url} after ${this.maxRetries} attempts: ${error.message}`);
                }

                // Exponential backoff
                const backoffTime = 1000 * Math.pow(2, attempt);
                console.log(`⏳ Retrying in ${backoffTime}ms...`);
                await this.sleep(backoffTime);
            }
        }
    }

    /**
     * Extract data from HTML
     * Must be implemented by child classes
     */
    async parseVehicleList(html) {
        throw new Error('parseVehicleList() must be implemented by child class');
    }

    /**
     * Extract vehicle details
     * Must be implemented by child classes
     */
    async parseVehicleDetails(html) {
        throw new Error('parseVehicleDetails() must be implemented by child class');
    }

    /**
     * Main scrape method
     * Must be implemented by child classes
     */
    async scrape() {
        throw new Error('scrape() must be implemented by child class');
    }

    /**
     * Log scraping progress
     */
    log(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${this.name}] ${message}`);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    }
}

export default BaseScraper;
