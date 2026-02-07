import { collections } from '../config/database.js';
import { fetchVehicleImages } from './image.service.js';

/**
 * Vehicle Service
 * Handles all vehicle data operations using MongoDB
 * Replaces RapidAPI service
 */

/**
 * Fetch vehicles from database
 */
export async function fetchVehicles(filters = {}) {
    try {
        // If database is not connected, return empty
        if (!collections || !collections.vehicles) {
            console.warn('⚠️  Database not connected');
            return [];
        }

        const query = buildQuery(filters);
        const limit = parseInt(filters.limit) || 12;
        const page = parseInt(filters.page) || 1;
        const skip = (page - 1) * limit;

        // Fetch from database
        const vehicles = await collections.vehicles()
            .find(query)
            .sort(getSortOption(filters.sortBy))
            .skip(skip)
            .limit(limit)
            .toArray();

        // if (vehicles.length === 0) {
        //     console.log('⚠️  Database empty');
        // }

        console.log(`✅ Fetched ${vehicles.length} vehicles from database`);
        return vehicles;

    } catch (error) {
        console.error('❌ Error fetching vehicles:', error.message);
        return [];
    }
}

/**
 * Fetch single vehicle by slug
 */
export async function fetchVehicleBySlug(slug) {
    try {
        if (!collections || !collections.vehicles) {
            return null;
        }

        const vehicle = await collections.vehicles().findOne({ slug });

        if (!vehicle) {
            console.log(`⚠️ Vehicle not found in DB: ${slug}`);
            return null;
        }

        console.log(`✅ Fetched vehicle: ${vehicle.brand} ${vehicle.model}`);
        return vehicle;

    } catch (error) {
        console.error(`❌ Error fetching vehicle ${slug}:`, error.message);
        return null; // Return null instead of mock
    }
}

/**
 * Get vehicle brands
 */
export async function getVehicleBrands(type) {
    try {
        if (!collections || !collections.vehicles) {
            return [];
        }

        // Aggregate to get brand and valid types
        const pipeline = [
            {
                $group: {
                    _id: '$brand',
                    types: { $addToSet: '$type' }
                }
            },
            { $sort: { _id: 1 } }
        ];

        let brands = await collections.vehicles().aggregate(pipeline).toArray();

        // If specific type filter demanded (and not 'all'), filter the list
        // BUT we want to keep the label info (e.g. "BMW - Car & Bike")
        // So we filter brands that CONTAIN the requested type
        if (type && type !== 'all') {
            brands = brands.filter(b => b.types.includes(type));
        }

        return brands.map(b => ({
            name: b._id,
            types: b.types.sort()
        }));

    } catch (error) {
        console.error('❌ Error fetching brands:', error.message);
        return [];
    }
}

/**
 * Search vehicles
 */
export async function searchVehicles(query, type) {
    try {
        if (!collections || !collections.vehicles) {
            return [];
        }

        const searchQuery = {
            $or: [
                { brand: { $regex: query, $options: 'i' } },
                { model: { $regex: query, $options: 'i' } }
            ]
        };

        if (type) {
            searchQuery.type = type;
        }

        const vehicles = await collections.vehicles()
            .find(searchQuery)
            .limit(20)
            .toArray();

        return vehicles;

    } catch (error) {
        console.error('❌ Search error:', error.message);
        return [];
    }
}

/**
 * Build MongoDB query from filters
 */
function buildQuery(filters) {
    const query = {};

    if (filters.type && filters.type !== 'all') {
        query.type = filters.type;
    }

    if (filters.condition) {
        query.condition = filters.condition;
    }

    if (filters.status) {
        const today = new Date().toISOString().split('T')[0];
        if (filters.status === 'upcoming') {
            query.releaseDate = { $gt: today };
        } else if (filters.status === 'released') {
            query.releaseDate = { $lte: today };
        }
    }

    if (filters.brand) {
        query.brand = { $regex: filters.brand, $options: 'i' };
    }

    if (filters.priceMin || filters.priceMax) {
        query.price = {};
        if (filters.priceMin) query.price.$gte = parseInt(filters.priceMin);
        if (filters.priceMax) query.price.$lte = parseInt(filters.priceMax);
    }

    if (filters.fuelType) {
        query['specs.fuelType'] = { $regex: filters.fuelType, $options: 'i' };
    }

    return query;
}

/**
 * Get brand statistics
 */
export async function getBrandStats() {
    try {
        if (!collections || !collections.vehicles) {
            return { cars: [], bikes: [] };
        }

        // Get car brand stats
        const carStats = await collections.vehicles().aggregate([
            { $match: { type: 'car' } },
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();

        // Get bike brand stats
        const bikeStats = await collections.vehicles().aggregate([
            { $match: { type: 'bike' } },
            { $group: { _id: '$brand', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();

        return {
            cars: carStats.map(s => ({ name: s._id, count: s.count })),
            bikes: bikeStats.map(s => ({ name: s._id, count: s.count }))
        };

    } catch (error) {
        console.error('❌ Error fetching brand stats:', error.message);
        return { cars: [], bikes: [] };
    }
}

/**
 * Get sort option
 */
function getSortOption(sortBy) {
    switch (sortBy) {
        case 'rating':
            return { rating: -1 };
        case 'price_low':
            return { price: 1 };
        case 'price_high':
            return { price: -1 };
        default:
            return { created_at: -1 };
    }
}



export default {
    fetchVehicles,
    fetchVehicleBySlug,
    getVehicleBrands,
    getBrandStats,
    searchVehicles
};
