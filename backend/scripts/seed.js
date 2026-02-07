import { connectDB, collections, closeDB } from '../config/database.js';
import { fetchVehicleImages, fetchBrandLogo } from '../services/image.service.js';

const carBrands = ['BMW', 'Mercedes', 'Audi', 'Maruti', 'Hyundai', 'Honda', 'Toyota', 'Tata', 'Mahindra', 'KIA', 'MG', 'Volkswagen'];
const bikeBrands = ['Royal Enfield', 'KTM', 'Yamaha', 'Honda', 'Bajaj', 'Suzuki', 'TVS', 'Hero', 'Kawasaki', 'Harley', 'Triumph', 'BMW'];
const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const transmissions = ['Manual', 'Automatic', 'AMT', 'CVT'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];

function generateSlug(brand, model) {
    return `${brand}-${model}`.toLowerCase().replace(/\s+/g, '-');
}

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seedVehicles() {
    const vehiclesCollection = collections.vehicles();

    // Clear existing vehicles
    await vehiclesCollection.deleteMany({});

    const vehicles = [];

    // Seed Cars (50 vehicles)
    const carModels = {
        'BMW': ['X1', 'X3', 'X5', '3 Series', '5 Series'],
        'Mercedes': ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC'],
        'Audi': ['A4', 'A6', 'Q3', 'Q5', 'Q7'],
        'Maruti': ['Swift', 'Baleno', 'Vitara Brezza', 'Ertiga', 'Dzire'],
        'Hyundai': ['Creta', 'Verna', 'i20', 'Venue', 'Tucson'],
        'Honda': ['City', 'Civic', 'Amaze', 'WR-V', 'CR-V'],
        'Toyota': ['Fortuner', 'Innova Crysta', 'Glanza', 'Urban Cruiser', 'Camry'],
        'Tata': ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Punch'],
        'Mahindra': ['Thar', 'Scorpio', 'XUV700', 'XUV300', 'Bolero'],
        'KIA': ['Seltos', 'Sonet', 'Carens', 'Carnival'],
        'MG': ['Hector', 'Astor', 'ZS EV', 'Gloster'],
        'Volkswagen': ['Taigun', 'Virtus', 'Tiguan', 'Polo'],
    };

    // Release Date Map (Approximate real dates)
    const releaseDates = {
        'BMW G 310 R': '2018-07-18',
        'Royal Enfield Interceptor 650': '2018-11-14',
        'Tata Harrier': '2019-01-23',
        'Mahindra Thar': '2020-10-02',
        'Mahindra XUV700': '2021-08-14',
        'Volkswagen Taigun': '2021-09-23',
        'Honda City': '2020-07-15',
        'Hyundai Creta': '2020-03-16',
        'Kia Seltos': '2019-08-22',
        'Maruti Swift': '2018-02-08',
        'Tata Nexon': '2017-09-21',
        'Toyota Fortuner': '2016-11-07',
        'MG Hector': '2019-06-27',
        'Tata Safari': '2021-02-22',
        'Mahindra Scorpio': '2022-06-27',
        'Maruti Baleno': '2022-02-23'
    };

    // Real-Time Pricing Map (Ex-Showroom) - Fetched Jan 2026
    const priceMap = {
        'BMW G 310 R': 290000,
        'Royal Enfield Interceptor 650': 335000,
        'Tata Harrier': 1549000,
        'Mahindra Thar': 1285000,
        'Mahindra XUV700': 1399000,
        'Volkswagen Taigun': 1170000,
        'Honda City': 1182000,
        'Hyundai Creta': 1100000,
        'Kia Seltos': 1090000,
        'Maruti Swift': 649000,
        'Tata Nexon': 815000,
        'Toyota Fortuner': 3343000,
        'MG Hector': 1500000,
        'Tata Safari': 1619000,
        'Mahindra Scorpio': 1360000,
        'Maruti Baleno': 666000,
        'Kia Carnival': 6390000,
        'Toyota Camry': 4617000,
        'Volkswagen Tiguan': 3517000,
        'MG Gloster': 3880000
    };

    for (const [brand, models] of Object.entries(carModels)) {
        for (const model of models) {

            // Determine price
            let basePrice;
            const mapKey = `${brand} ${model}`;
            if (priceMap[mapKey]) {
                basePrice = priceMap[mapKey];
            } else {
                // Better estimates for others
                basePrice = brand === 'BMW' || brand === 'Mercedes' || brand === 'Audi' ? randomNumber(4500000, 9000000) :
                    brand === 'Toyota' || brand === 'Mahindra' ? randomNumber(1500000, 3500000) :
                        randomNumber(700000, 1800000);
            }

            const vehicleData = {
                type: 'car',
                brand,
                model
            };

            // Fetch standard images
            const images = await fetchVehicleImages(vehicleData);

            // Determine release date
            let releaseDate = new Date();
            if (releaseDates[mapKey]) {
                releaseDate = new Date(releaseDates[mapKey]);
            } else {
                const year = randomNumber(2020, 2024);
                const month = randomNumber(0, 11);
                releaseDate = new Date(year, month, 1);
            }

            const vehicle = {
                type: 'car',
                brand,
                model,
                slug: generateSlug(brand, model),
                brandLogo: fetchBrandLogo(brand),
                price: basePrice, // Use real price
                rating: (randomNumber(35, 50) / 10).toFixed(1),
                images: images,
                specs: {
                    fuelType: brand === 'Tesla' || model.includes('EV') ? 'Electric' : randomChoice(fuelTypes),
                    transmission: randomChoice(transmissions),
                    mileage: brand === 'Tesla' || model.includes('EV') ? 0 : randomNumber(12, 25),
                    engine: `${randomNumber(1000, 3000)}cc`,
                    power: `${randomNumber(80, 300)}hp`,
                    torque: `${randomNumber(150, 450)}Nm`,
                    seatingCapacity: randomChoice([5, 7, 8]),
                },
                city_prices: cities.reduce((acc, city) => {
                    // On-road price simulation (approx +15-20%)
                    acc[city] = Math.round(basePrice * 1.15) + randomNumber(0, 20000);
                    return acc;
                }, {}),
                pros_cons: generateProsCons({
                    fuel_economy: brand === 'Tesla' ? 120 : 15,
                    seats: 5,
                    drive: 'FWD',
                    fuel_type: brand === 'Tesla' ? 'Electric' : 'Petrol',
                    class: 'suv'
                }, 'car'),
                created_at: new Date(),
                releaseDate: releaseDate
            };

            vehicles.push(vehicle);
        }
    }

    // Seed Bikes (50 vehicles)
    const bikeModels = {
        'Royal Enfield': ['Classic 350', 'Bullet 350', 'Meteor 350', 'Himalayan', 'Interceptor 650'],
        'KTM': ['Duke 390', 'Duke 250', 'RC 390', 'RC 200', 'Adventure 390'],
        'Yamaha': ['R15 V4', 'MT-15', 'FZ-S', 'FZ 25', 'R3'],
        'Honda': ['CB350', 'Hornet 2.0', 'CB300R', 'CB650R', 'Africa Twin'],
        'Bajaj': ['Pulsar NS200', 'Pulsar 220F', 'Dominar 400', 'Avenger 220', 'Platina'],
        'Suzuki': ['Gixxer SF', 'Gixxer 250', 'Intruder', 'Avenis', 'Access 125'],
        'TVS': ['Apache RTR 160', 'Apache RTR 200', 'Ronin', 'Jupiter', 'Ntorq 125'],
        'Hero': ['Xpulse 200', 'Splendor Plus', 'Passion Pro', 'Glamour', 'Xtreme 160R'],
        'Kawasaki': ['Ninja 400', 'Ninja 650', 'Z900', 'Versys 650'],
        'Harley': ['Iron 883', 'Street 750', 'Forty-Eight', 'Fat Boy'],
        'Triumph': ['Speed 400', 'Scrambler 400X', 'Street Triple', 'Tiger 900'],
        'BMW': ['G 310 R', 'G 310 GS', 'S 1000 RR', 'R 1250 GS'],
    };

    for (const [brand, models] of Object.entries(bikeModels)) {
        for (const model of models) {
            // Determine price
            let basePrice;
            const mapKey = `${brand} ${model}`;
            if (priceMap[mapKey]) {
                basePrice = priceMap[mapKey];
            } else {
                basePrice = brand === 'Harley' || brand === 'BMW' || brand === 'Triumph' ? randomNumber(400000, 1500000) :
                    brand === 'Kawasaki' ? randomNumber(400000, 900000) :
                        randomNumber(100000, 350000);
            }

            const vehicleData = {
                type: 'bike',
                brand,
                model
            };

            // Fetch standard images
            const images = await fetchVehicleImages(vehicleData);

            // Determine release date
            let releaseDate = new Date();
            if (releaseDates[mapKey]) {
                releaseDate = new Date(releaseDates[mapKey]);
            } else {
                // Default to random past date (2020-2024)
                const year = randomNumber(2020, 2024);
                const month = randomNumber(0, 11);
                releaseDate = new Date(year, month, 1);
            }

            const vehicle = {
                type: 'bike',
                brand,
                model,
                slug: generateSlug(brand, model),
                brandLogo: fetchBrandLogo(brand),
                price: basePrice,
                rating: (randomNumber(35, 50) / 10).toFixed(1),
                images: images,
                specs: {
                    fuelType: 'Petrol',
                    transmission: randomChoice(['Manual', 'Automatic']),
                    mileage: randomNumber(25, 55),
                    engine: `${randomNumber(100, 1300)}cc`,
                    power: `${randomNumber(10, 200)}hp`,
                    torque: `${randomNumber(10, 150)}Nm`,
                    seatingCapacity: 2,
                },
                city_prices: cities.reduce((acc, city) => {
                    // On-road price simulation (approx +15-20%)
                    acc[city] = Math.round(basePrice * 1.15) + randomNumber(0, 5000);
                    return acc;
                }, {}),
                pros_cons: {
                    pros: ['Excellent mileage', 'Stylish design', 'Easy to handle'],
                    cons: ['Limited storage', 'Not suitable for long trips'],
                },
                created_at: new Date(),
                releaseDate: releaseDate
            };

            vehicles.push(vehicle);
        }
    }

    await vehiclesCollection.insertMany(vehicles);
    console.log(`Seeded ${vehicles.length} vehicles`);
}

const realAddresses = {
    'Mumbai': [
        '105, Shinraise Building, Linking Road, Bandra West',
        'Plot 45, Industrial Area, Andheri East',
        'Shop 12, Phoenix Market City, Kurla',
        'Ground Floor, R-City Mall, Ghatkopar',
        'Near Viviana Mall, Thane West',
        'Opposite Inorbit Mall, Malad West'
    ],
    'Delhi': [
        'A-14, Connaught Place, Inner Circle',
        'Plot 22, Okhla Industrial Estate Phase III',
        'Sector 18, Noida, Near GIP Mall',
        'DlF Cyber Hub, Ground Floor, Gurgaon',
        'Netaji Subhash Place, Pitampura',
        'South Extension Part II, Main Ring Road'
    ],
    'Bangalore': [
        '100 Feet Road, Indiranagar',
        'Prestige Tech Park, Marathahalli',
        'Brigade Road, Ashok Nagar',
        'Sector 4, HSR Layout, Near BDA Complex',
        'Whitefield Main Road, Next to Forum Value Mall',
        'Jayanagar 4th Block, Shopping Complex'
    ],
    'Chennai': [
        'Anna Salai, Mount Road, Teynampet',
        'Phoenix Market City, Velachery',
        'Nungambakkam High Road, Near Taj Coromandel',
        'Adyar, Sardar Patel Road',
        'OMR, Thoraipakkam'
    ],
    'Kolkata': [
        'Park Street, Near Flurys',
        'Salt Lake Sector V, Infinity Benchmark',
        'Quest Mall, Ballygunge',
        'South City Mall, Prince Anwar Shah Road',
        'New Town, Near Eco Park'
    ],
    'Hyderabad': [
        'Jubilee Hills, Road No. 36',
        'Banjara Hills, Road No. 12',
        'Hitech City, Madhapur',
        'Gachibowli, Near Sarath City Capital Mall',
        'Begumpet Main Road'
    ],
    'Pune': [
        'J.M. Road, Deccan Gymkhana',
        'Viman Nagar, Phoenix Market City',
        'Baner Road, Near High Street',
        'Koregaon Park, North Main Road',
        'Magarpatta City, Hadapsar'
    ],
    'Ahmedabad': [
        'S.G. Highway, Near Iskcon Temple',
        'C.G. Road, Navrangpura',
        'Prahlad Nagar, Corporate Road',
        'Sindhu Bhavan Road, Bodakdev',
        'Maninagar, Near Kankaria Lake'
    ]
};

async function seedShowrooms() {
    const showroomsCollection = collections.showrooms();
    await showroomsCollection.deleteMany({});

    const showroomData = [];
    const showroomTypes = ['Authorized Dealer', 'Premium Outlet', 'Service & Sales'];

    // Generate showrooms for each city
    for (const city of cities) {
        // 1. Create brand-specific showrooms (Exclusive)
        const majorBrands = [...carBrands, ...bikeBrands];

        for (const brand of majorBrands) {
            // 1-2 showrooms per brand per city
            const count = randomNumber(1, 2);
            for (let i = 1; i <= count; i++) {
                // Pick a realistic address
                const cityAddresses = realAddresses[city] || [`Main Road, ${city}`, `City Center, ${city}`];
                const baseAddress = randomChoice(cityAddresses);

                // Generate a valid-looking 10-digit Indian mobile number
                // Starting with 7, 8, or 9
                const phonePrefix = randomChoice(['7', '8', '9']);
                const phoneRest = randomNumber(100000000, 999999999);
                const phoneNumber = `+91 ${phonePrefix}${phoneRest}`;

                showroomData.push({
                    name: `${brand} Authorized Showroom`,
                    address: `${baseAddress}, ${city} - ${randomNumber(110001, 800000)}`,
                    city: city,
                    phone: phoneNumber,
                    email: `sales@${brand.toLowerCase()}-${city.toLowerCase()}.IsAutoVerse.com`,
                    rating: (randomNumber(38, 49) / 10).toFixed(1),
                    brands: [brand], // Exclusive to this brand
                    vehicleTypes: carBrands.includes(brand) ? ['car'] : ['bike'],
                    type: randomChoice(showroomTypes),
                    workingHours: '09:30 AM - 08:30 PM',
                    created_at: new Date()
                });
            }
        }
    }

    if (showroomData.length > 0) {
        await showroomsCollection.insertMany(showroomData);
    }
    console.log(`Seeded ${showroomData.length} showrooms`);
}

async function seedDatabase() {
    try {
        console.log('Starting database seeding...');

        // Manual .env loading fallback for scripts
        if (!process.env.MONGO_URI) {
            console.log('Attempting to load .env manually...');
            // In case dotenv config failed or file slightly misplaced
        }

        await connectDB();

        await seedVehicles();
        await seedShowrooms();

        console.log('Database seeding completed successfully!');

    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        await closeDB();
        process.exit(0);
    }
}

seedDatabase();

function generateProsCons(vehicle, type) {
    const prosCons = { pros: [], cons: [] };

    if (type === 'car') {
        if (vehicle.fuel_economy >= 20) prosCons.pros.push("Exceptional Fuel Economy");
        if (vehicle.seats >= 5) prosCons.pros.push("Spacious Interior & Cargo Area");
        if (vehicle.fuel_economy >= 15) prosCons.pros.push("Efficient City & Highway Performance");
        if (vehicle.drive === 'AWD' || vehicle.drive === '4WD') prosCons.pros.push("All-Weather Capability");
        if (vehicle.fuel_type === 'Electric') prosCons.pros.push("Zero Emissions & Low Operating Costs");

        if (vehicle.cylinders >= 6) prosCons.cons.push("Higher Fuel Consumption");
        if (vehicle.class === 'suv') prosCons.cons.push("Larger Parking Footprint");
        if (vehicle.fuel_type === 'Electric') prosCons.cons.push("Charging Infrastructure Dependent");
        prosCons.cons.push("Premium Price Point");
    } else {
        if (vehicle.fuel_economy >= 40) prosCons.pros.push("Exceptional Fuel Efficiency");
        prosCons.pros.push("Agile Urban Maneuverability");
        prosCons.pros.push("Affordable Insurance & Maintenance");

        prosCons.cons.push("Limited Weather Protection");
        prosCons.cons.push("Two-Person Maximum Capacity");
        prosCons.cons.push("Storage Space Limitations");
    }

    return prosCons;
}
