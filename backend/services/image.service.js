import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Image service for fetching vehicle images
// Uses hardcoded high-quality images for demo consistency
// Fallbacks to specific keyword searches

const imageCache = new Map();

// High-quality logos (Clearbit API)
export const BRAND_LOGOS = {
    // Cars
    'BMW': 'https://logo.clearbit.com/bmw.com',
    'Mercedes': 'https://logo.clearbit.com/mercedes-benz.com',
    'Audi': 'https://logo.clearbit.com/audi.com',
    'Maruti': 'https://logo.clearbit.com/marutisuzuki.com',
    'Hyundai': 'https://logo.clearbit.com/hyundai.com',
    'Honda': 'https://logo.clearbit.com/hondacarindia.com',
    'Toyota': 'https://logo.clearbit.com/toyotabharat.com',
    'Tata': 'https://logo.clearbit.com/tatamotors.com',
    'Mahindra': 'https://logo.clearbit.com/mahindra.com',
    'KIA': 'https://logo.clearbit.com/kia.com',
    'MG': 'https://logo.clearbit.com/mgmotor.co.in',
    'Volkswagen': 'https://logo.clearbit.com/volkswagen.co.in',

    // Bikes
    'Royal Enfield': 'https://logo.clearbit.com/royalenfield.com',
    'KTM': 'https://logo.clearbit.com/ktm.com',
    'Yamaha': 'https://logo.clearbit.com/yamaha-motor-india.com',
    'Bajaj': 'https://logo.clearbit.com/bajajauto.com',
    'Suzuki': 'https://logo.clearbit.com/suzukimotorcycle.co.in',
    'TVS': 'https://logo.clearbit.com/tvsmotor.com',
    'Hero': 'https://logo.clearbit.com/heromotocorp.com',
    'Kawasaki': 'https://logo.clearbit.com/kawasaki-india.com',
    'Harley': 'https://logo.clearbit.com/harley-davidson.com',
    'Triumph': 'https://logo.clearbit.com/triumphmotorcycles.in'
};

/**
 * Fetch vehicle images
 * Returns structured object with exterior, interior, colors, and 3D
 */
export async function fetchVehicleImages(vehicle) {
    const safeName = `${vehicle.brand}-${vehicle.model}`.toLowerCase().replace(/\s+/g, '-');
    const type = vehicle.type || 'car';

    console.log(`🖼️  [Image Service] Fetching images for: "${safeName}" (brand: "${vehicle.brand}", model: "${vehicle.model}")`);

    // 1. Get Base Images
    const baseImages = getBaseImages(safeName, type, vehicle.brand);

    // 2. Generate Colors
    const colors = getVehicleColors(vehicle.brand, type);

    // 3. Generate 3D/360 View (Mock URL)
    const threeD = `https://example.com/3d/${safeName}`;

    return {
        exterior: baseImages.exterior,
        interior: baseImages.interior,
        colors: colors,
        threeD: threeD,
        all: [...baseImages.exterior, ...baseImages.interior]
    };
}

export function fetchBrandLogo(brandName) {
    return BRAND_LOGOS[brandName] || 'https://via.placeholder.com/150?text=' + brandName;
}

function getBaseImages(slug, type, brand) {
    const MOCK_DB = {
        // --- CARS (Studio Shots/Side Profiles) ---
        'toyota-fortuner': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/44709/fortuner-exterior-right-front-three-quarter-20.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/44709/fortuner-exterior-right-side-view.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/44709/fortuner-exterior-rear-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/44709/fortuner-interior-dashboard.jpeg?q=80']
        },
        'hyundai-creta': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/141113/creta-exterior-right-front-three-quarter.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/141113/creta-exterior-right-side-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/141113/creta-interior-dashboard.jpeg?q=80']
        },
        'mahindra-thar': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/40087/thar-exterior-right-front-three-quarter-11.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/40087/thar-exterior-right-side-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/40087/thar-interior-dashboard.jpeg?q=80']
        },
        'kia-seltos': {
            exterior: ['https://imgd.aeplcdn.com/664x374/n/cw/ec/192817/seltos-exterior-right-front-three-quarter-50.png?isig=0&q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/149719/seltos-interior-dashboard.jpeg?q=80']
        },
        'honda-civic': {
            exterior: ['https://imgd.aeplcdn.com/664x374/n/cw/ec/27074/civic-exterior-right-front-three-quarter-148156.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/134287/city-interior-dashboard.jpeg?q=80'] // Fallback to City interior
        },
        'maruti-swift': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/145555/swift-exterior-right-front-three-quarter.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/145555/swift-interior-dashboard.jpeg?q=80']
        },
        'maruti-baleno': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/102663/baleno-exterior-right-front-three-quarter-67.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/102663/baleno-exterior-right-side-view.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/102663/baleno-exterior-rear-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/102663/baleno-interior-dashboard.jpeg?q=80']
        },
        'tata-nexon': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/141867/nexon-exterior-right-front-three-quarter-71.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/141867/nexon-interior-dashboard-8.jpeg?q=80']
        },
        'volkswagen-virtus': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/144681/virtus-exterior-right-front-three-quarter-11.png?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/144681/virtus-exterior-right-side-view.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/144681/virtus-exterior-rear-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/144681/virtus-interior-dashboard.jpeg?q=80']
        },
        'volkswagen-tiguan': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/53123/tiguan-exterior-right-front-three-quarter-4.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/53123/tiguan-exterior-right-side-view.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/53123/tiguan-exterior-rear-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/53123/tiguan-interior-dashboard.jpeg?q=80']
        },
        'volkswagen-taigun': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/115405/taigun-exterior-right-front-three-quarter.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/115405/taigun-exterior-right-side-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/115405/taigun-interior-dashboard.jpeg?q=80']
        },
        'volkswagen-polo': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/48270/polo-exterior-right-front-three-quarter.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/48270/polo-exterior-right-side-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/48270/polo-interior-dashboard.jpeg?q=80']
        },
        'honda-city': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/134287/city-exterior-right-front-three-quarter.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/134287/city-interior-dashboard.jpeg?q=80']
        },
        'bmw-x1': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/140591/x1-exterior-right-front-three-quarter.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/140591/x1-interior-dashboard.jpeg?q=80']
        },
        'mercedes-c-class': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/106821/c-class-exterior-right-front-three-quarter-4.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/106821/c-class-interior-dashboard.jpeg?q=80']
        },
        'audi-q7': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/53613/q7-exterior-right-front-three-quarter-3.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/53613/q7-interior-dashboard.jpeg?q=80']
        },
        'bmw-x5': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/152681/x5-exterior-right-front-three-quarter-7.png?isig=0&q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/151833/x5-facelift-interior-dashboard.jpeg?q=80']
        },
        'hyundai-venue': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/197163/venue-exterior-right-front-three-quarter-38.png?isig=0&q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/141113/creta-interior-dashboard.jpeg?q=80'] // Fallback to Creta interior or generic
        },
        'mercedes-e-class': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/47543/e-class-exterior-right-front-three-quarter.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/47543/e-class-interior-dashboard.jpeg?q=80']
        },

        // --- BIKES (Studio Shots) ---
        'royal-enfield-classic-350': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/98939/classic-350-right-front-three-quarter-7.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/98939/classic-350-right-side-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/98939/classic-350-instrument-cluster.jpeg?q=80']
        },
        'royal-enfield-hunter-350': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/124013/hunter-350-right-front-three-quarter.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/124013/hunter-350-speedometer.jpeg?q=80']
        },
        'yamaha-r15-v4': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/103847/r15-v4-right-front-three-quarter.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/103847/r15-v4-instrument-cluster.jpeg?q=80']
        },
        'ktm-duke-390': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/147043/390-duke-right-front-three-quarter.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/147043/390-duke-instrument-cluster.jpeg?q=80']
        },
        'ktm-rc-200': {
            exterior: ['https://imgd.aeplcdn.com/1280x720/n/cw/ec/146607/rc-200-right-front-three-quarter-4.png?isig=0&q=80'],
            interior: ['https://imgd.aeplcdn.com/1280x720/n/cw/ec/146607/rc-200-instrument-cluster.jpeg?q=80']
        },
        'tvs-apache-rtr-160': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/128955/apache-rtr-160-right-front-three-quarter.jpeg?q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/128955/apache-rtr-160-instrument-cluster.jpeg?q=80']
        },
        'suzuki-access-125': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/51624/access-125-right-front-three-quarter-15.jpeg?q=80'],
            interior: []
        },
        'bmw-g-310-gs': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/194761/g-310-gs-right-front-three-quarter.png?isig=0&q=80',
                'https://via.placeholder.com/800x600/667eea/ffffff?text=BMW+G+310+GS'
            ],
            interior: []
        },
        'triumph-scrambler-400x': {
            exterior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/151747/scrambler-400-x-right-front-three-quarter.jpeg?q=80'],
            interior: []
        },
        'bajaj-pulsar-220f': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/142305/pulsar-220-right-front-three-quarter-16.jpeg?isig=0&q=80',
                'https://via.placeholder.com/800x600/764ba2/ffffff?text=Bajaj+Pulsar+220F'
            ],
            interior: ['https://via.placeholder.com/800x600/333333/ffffff?text=Instrument+Cluster']
        },
        'bajaj-pulsar-ns200': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/49459/pulsar-ns200-right-front-three-quarter-4.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/49459/pulsar-ns200-right-side-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/49459/pulsar-ns200-instrument-cluster.jpeg?q=80']
        },
        'bajaj-dominar-400': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/144629/dominar-400-right-front-three-quarter.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/144629/dominar-400-right-side-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/144629/dominar-400-instrument-cluster.jpeg?q=80']
        },
        'bajaj-ct-110': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/48067/ct-110-right-front-three-quarter.jpeg?q=80'
            ],
            interior: []
        },
        'bajaj-platina-110': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/102819/platina-110-right-front-three-quarter.jpeg?q=80'
            ],
            interior: []
        },
        'bajaj-avenger-220': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/94173/avenger-cruise-220-right-front-three-quarter-9.png?isig=0&q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/49447/avenger-220-right-side-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/49447/avenger-220-instrument-cluster.jpeg?q=80']
        },
        'kawasaki-ninja-400': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/124863/ninja-400-right-front-three-quarter-7.jpeg?isig=0&q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/49477/ninja-400-right-side-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/49477/ninja-400-instrument-cluster.jpeg?q=80']
        },
        'kawasaki-ninja-650': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/201287/ninja-650-right-front-three-quarter.jpeg?isig=0&q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/49479/ninja-650-right-side-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/49479/ninja-650-instrument-cluster.jpeg?q=80']
        },
        'kawasaki-z900': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/49481/z900-right-front-three-quarter.jpeg?q=80',
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/49481/z900-right-side-view.jpeg?q=80'
            ],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/49481/z900-instrument-cluster.jpeg?q=80']
        },
        'kawasaki-versys-650': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/201873/versys-650-2025-right-front-three-quarter.jpeg?isig=0&q=80'
            ],
            interior: []
        },
        'suzuki-gixxer-sf': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/195417/gixxer-sf-right-front-three-quarter.jpeg?isig=0&q=80'
            ],
            interior: []
        },
        'hero-xtreme-160r': {
            exterior: [
                'https://imgd.aeplcdn.com/1056x594/n/cw/ec/127127/xtreme-right-front-three-quarter-6.png?isig=0&q=80'
            ],
            interior: []
        }
    };

    // Try exact match first
    if (MOCK_DB[slug]) {
        console.log(`✅ [Image Service] Found exact match for slug: "${slug}"`);
        return MOCK_DB[slug];
    }

    // Additional specific mappings
    const ADDITIONAL_DB = {
        'kia-sonet': {
            exterior: ['https://imgd.aeplcdn.com/664x374/n/cw/ec/174423/sonet-exterior-right-front-three-quarter-12.png?isig=0&q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/174423/sonet-interior-dashboard.jpeg?q=80']
        },
        'toyota-innova-crysta': {
            exterior: ['https://imgd.aeplcdn.com/664x374/n/cw/ec/140809/innova-crysta-exterior-right-front-three-quarter-3.png?isig=0&q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/140809/innova-crysta-interior-dashboard.jpeg?q=80']
        },
        'toyota-urban-cruiser': {
            exterior: ['https://imgd.aeplcdn.com/664x374/n/cw/ec/132427/taisor-exterior-right-front-three-quarter-41.png?isig=0&q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/132427/taisor-interior-dashboard.jpeg?q=80']
        },
        'audi-a4': {
            exterior: ['https://imgd.aeplcdn.com/664x374/n/cw/ec/51909/a4-exterior-right-front-three-quarter-80.png?isig=0&q=80'],
            interior: ['https://imgd.aeplcdn.com/1056x594/n/cw/ec/51909/a4-interior-dashboard.jpeg?q=80']
        }
    };

    if (ADDITIONAL_DB[slug]) {
        console.log(`✅ [Image Service] Found additional match for slug: "${slug}"`);
        return ADDITIONAL_DB[slug];
    }

    // Try normalized brand variations (e.g., "Maruti Suzuki" → "Maruti")
    const normalizedSlug = normalizeSlug(slug);
    if (normalizedSlug !== slug && MOCK_DB[normalizedSlug]) {
        console.log(`✅ [Image Service] Found normalized match: "${slug}" → "${normalizedSlug}"`);
        return MOCK_DB[normalizedSlug];
    }

    // FALLBACK: Use specific CarWale-style URLs if possible or clean generic images
    console.log(`⚠️  [Image Service] No match found for slug: "${slug}", using default ${type} image`);
    const defaultCar = 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/123185/grand-vitara-exterior-right-front-three-quarter-2.jpeg?q=80';
    const defaultBike = 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/101487/classic-350-exterior-right-front-three-quarter.jpeg?q=80';

    return {
        exterior: [
            type === 'car' ? defaultCar : defaultBike
        ],
        interior: [
            type === 'car' ? 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/44709/fortuner-interior-dashboard.jpeg?q=80' : ''
        ]
    };
}

// Helper function to normalize brand names
function normalizeSlug(slug) {
    // Common brand normalizations: "maruti-suzuki-baleno" → "maruti-baleno"
    const brandNormalizations = {
        'maruti-suzuki': 'maruti',
        'mercedes-benz': 'mercedes'
    };

    // Try to find and replace brand prefix
    for (const [fullBrand, shortBrand] of Object.entries(brandNormalizations)) {
        if (slug.startsWith(fullBrand + '-')) {
            return slug.replace(fullBrand, shortBrand);
        }
    }

    return slug;
}

function getVehicleColors(brand, type) {
    // Return colors with optional color-specific images
    // For now, using null for images - can be updated with actual color variant URLs later
    const colors = [
        { name: 'Cosmic Black', hex: '#1a1a1a', image: null },
        { name: 'Pearl White', hex: '#f0f0f0', image: null },
        { name: 'Racing Red', hex: '#d32f2f', image: null },
        { name: 'Metallic Silver', hex: '#9e9e9e', image: null },
        { name: 'Deep Blue', hex: '#1565c0', image: null }
    ];

    // Brand-specific colors could be added here
    // Example: if (brand === 'BMW') { colors.push({ name: 'BMW Blue', hex: '#0066b1', image: 'url' }); }

    return colors;
}

export function clearImageCache() {
    imageCache.clear();
}

export default {
    fetchVehicleImages,
    fetchBrandLogo,
    clearImageCache,
    BRAND_LOGOS
};
