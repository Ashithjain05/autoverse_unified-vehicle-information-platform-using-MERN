import express from 'express';
import scraperService from '../services/scraper.service.js';

const router = express.Router();

/**
 * Trigger full scrape from all sources
 * GET /api/scraper/scrape-all
 */
router.get('/scrape-all', async (req, res) => {
    try {
        console.log('🚀 Scraping triggered via API...');

        // Start scraping in background
        scraperService.scrapeAll()
            .then(result => {
                console.log('✅ Background scraping complete:', result);
            })
            .catch(error => {
                console.error('❌ Background scraping failed:', error.message);
            });

        res.json({
            success: true,
            message: 'Scraping started in background. Check server logs for progress.'
        });

    } catch (error) {
        console.error('Scrape trigger error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Scrape from specific source
 * GET /api/scraper/scrape/:source
 */
router.get('/scrape/:source', async (req, res) => {
    try {
        const { source } = req.params;

        console.log(`🎯 Scraping ${source} via API...`);

        // Start scraping in background
        scraperService.scrapeSource(source)
            .then(vehicles => {
                console.log(`✅ ${source} scraping complete: ${vehicles.length} vehicles`);
            })
            .catch(error => {
                console.error(`❌ ${source} scraping failed:`, error.message);
            });

        res.json({
            success: true,
            message: `${source} scraping started. Check server logs for progress.`
        });

    } catch (error) {
        console.error('Scrape trigger error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Get scraping statistics
 * GET /api/scraper/stats
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await scraperService.getStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
