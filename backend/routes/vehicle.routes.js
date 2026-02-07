import express from 'express';
import vehicleService from '../services/vehicle.service.js';

const router = express.Router();

/**
 * Get vehicles with filters and pagination
 * Uses MongoDB database (not RapidAPI)
 */
router.get('/', async (req, res) => {
    try {
        const vehicles = await vehicleService.fetchVehicles(req.query);

        res.json({
            success: true,
            data: vehicles,
            pagination: {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 12,
                total: vehicles.length
            }
        });
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch vehicles' });
    }
});

/**
 * Get vehicle by slug
 */
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const vehicle = await vehicleService.fetchVehicleBySlug(slug);

        if (!vehicle) {
            return res.status(404).json({ success: false, error: 'Vehicle not found' });
        }

        res.json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch vehicle' });
    }
});

/**
 * Get vehicle brands
 */
router.get('/meta/brands', async (req, res) => {
    try {
        const { type } = req.query;

        // if (!type) {
        //     return res.status(400).json({ success: false, error: 'Vehicle type required' });
        // }

        const brands = await vehicleService.getVehicleBrands(type);

        res.json({
            success: true,
            data: brands
        });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch brands' });
    }
});

/**
 * Get brand statistics
 */
router.get('/meta/brand-stats', async (req, res) => {
    try {
        const stats = await vehicleService.getBrandStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get brand stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch brand stats' });
    }
});

/**
 * Search vehicles
 */
router.get('/search/query', async (req, res) => {
    try {
        const { q, type } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, error: 'Search query required' });
        }

        const results = await vehicleService.searchVehicles(q, type);

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, error: 'Search failed' });
    }
});

export default router;
