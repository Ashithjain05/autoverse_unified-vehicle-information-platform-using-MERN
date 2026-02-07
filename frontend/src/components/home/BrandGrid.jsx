import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useVehicle } from '../../context/VehicleContext.jsx';
import api from '../../services/api.js';
import './BrandGrid.css';

function BrandGrid() {
    const navigate = useNavigate();

    const [carBrands, setCarBrands] = useState([]);
    const [bikeBrands, setBikeBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    const [expandedCars, setExpandedCars] = useState(false);
    const [expandedBikes, setExpandedBikes] = useState(false);

    // Reliable Brand Logo Map
    const brandLogoMap = {
        // Car Brands
        'Maruti': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/suzuki.png',
        'Tata': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/tata.png',
        'Mahindra': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mahindra.png',
        'Hyundai': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/hyundai.png',
        'Honda': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/honda.png',
        'Toyota': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/toyota.png',
        'Kia': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/kia.png',
        'MG': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mg.png',
        'Volkswagen': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volkswagen.png',
        'Skoda': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/skoda.png',
        'Audi': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/audi.png',
        'Mercedes': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mercedes-benz.png',
        'BMW': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bmw.png',
        'Renault': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/renault.png',
        'Nissan': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/nissan.png',
        'Jeep': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/jeep.png',
        'Citroen': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/citroen.png',
        'Land Rover': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/land-rover.png',
        'Jaguar': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/jaguar.png',
        'Volvo': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volvo.png',
        'Porsche': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/porsche.png',
        'Lexus': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/lexus.png',
        'Mini': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mini.png',
        'Ferrari': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ferrari.png',
        'Lamborghini': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/lamborghini.png',
        'Bentley': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bentley.png',
        'Rolls-Royce': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/rolls-royce.png',
        'Aston Martin': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/aston-martin.png',
        'Maserati': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/maserati.png',
        'McLaren': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mclaren.png',
        'Tesla': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/tesla.png',
        'BYD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/BYD_Auto_Logo.svg/2560px-BYD_Auto_Logo.svg.png',
        'Force Motors': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Force_Motors_Logo.png',
        'Isuzu': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/isuzu.png',
        'Vinfast': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/VinFast_logo.svg/2560px-VinFast_logo.svg.png',
        'Fisker': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Fisker_Inc._logo.svg/1024px-Fisker_Inc._logo.svg.png',
        'Lotus': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/lotus.png',

        // Bike Brands
        'Hero': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Hero_MotoCorp_Logo.svg/1280px-Hero_MotoCorp_Logo.svg.png',
        'Bajaj': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Bajaj_auto_logo.svg/1280px-Bajaj_auto_logo.svg.png',
        'TVS': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e9/TVS_Motor_logo.svg/1280px-TVS_Motor_logo.svg.png',
        'Royal Enfield': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Royal_Enfield_logo_new.svg/1280px-Royal_Enfield_logo_new.svg.png',
        'Yamaha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Yamaha_Motor_Logo_%28full%29.svg/1280px-Yamaha_Motor_Logo_%28full%29.svg.png',
        'Suzuki': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/suzuki.png',
        'KTM': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ktm.png',
        'Jawa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Jawa_Moto_logo.svg/640px-Jawa_Moto_logo.svg.png',
        'Kawasaki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Kawasaki-logo.svg/640px-Kawasaki-logo.svg.png',
        'Triumph': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Triumph_Motorcycles_logo.svg/640px-Triumph_Motorcycles_logo.svg.png',
        'Harley-Davidson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Harley-Davidson_Logo.svg/640px-Harley-Davidson_Logo.svg.png',
        'Harley': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Harley-Davidson_Logo.svg/640px-Harley-Davidson_Logo.svg.png',
        'Ducati': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Ducati_red_logo.svg/1024px-Ducati_red_logo.svg.png',
        'Benelli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Benelli_Logo_2022.svg/1200px-Benelli_Logo_2022.svg.png',
        'Aprilia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Aprilia_logo.svg/2560px-Aprilia_logo.svg.png',
        'Husqvarna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Husqvarna_Logo.svg/2560px-Husqvarna_Logo.svg.png',
        'Ola': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ola_Electric_Logo.svg/2560px-Ola_Electric_Logo.svg.png',
        'Ather': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Ather_Energy_Logo.svg/2560px-Ather_Energy_Logo.svg.png',
        'Revolt': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Revolt_Motors_Logo.png/640px-Revolt_Motors_Logo.png',
        'Ultraviolette': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Ultraviolette_Automotive_Logo.svg/2560px-Ultraviolette_Automotive_Logo.svg.png',
        'Tork': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Tork_Motors_Logo.png',
        'Vespa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Vespa_logo.svg/2560px-Vespa_logo.svg.png',
        'Norton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Norton_Motorcycles_logo.svg/2560px-Norton_Motorcycles_logo.svg.png',
        'MV Agusta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/MV_Agusta_Logo.svg/1200px-MV_Agusta_Logo.svg.png',
        'Indian': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Indian_Motorcycle_Logo.svg/2560px-Indian_Motorcycle_Logo.svg.png',
        'Zontes': 'https://upload.wikimedia.org/wikipedia/commons/4/41/Zontes_Logo.png',
        'Ampere': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Ampere_Vehicles_Logo.png/640px-Ampere_Vehicles_Logo.png',
        'Okinawa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Okinawa_Autotech_Logo.png/640px-Okinawa_Autotech_Logo.png',
        'Bounce': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Bounce_Infinity_Logo.svg/2560px-Bounce_Infinity_Logo.svg.png',
        'Yezdi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Yezdi_Logo.svg/2560px-Yezdi_Logo.svg.png',
        'BSA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/BSA_Company_Logo.svg/1200px-BSA_Company_Logo.svg.png',
        'Hero Electric': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Hero_MotoCorp_Logo.svg/1280px-Hero_MotoCorp_Logo.svg.png' // Fallback to Hero
    };

    const ALL_CAR_BRANDS = [
        'Maruti', 'Hyundai', 'Tata', 'Mahindra', 'Honda', 'Toyota', 'Kia', 'MG',
        'Volkswagen', 'Renault', 'Skoda', 'Nissan', 'Citroen', 'Jeep', 'Land Rover',
        'Jaguar', 'BMW', 'Mercedes', 'Audi', 'Volvo', 'Lexus', 'Porsche', 'Mini',
        'Ferrari', 'Lamborghini', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'Maserati',
        'Tesla', 'BYD', 'McLaren', 'Force Motors', 'Isuzu', 'Vinfast', 'Lotus', 'Fisker'
    ];

    const ALL_BIKE_BRANDS = [
        'Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki',
        'KTM', 'Jawa', 'Kawasaki', 'Triumph', 'Harley', 'Ducati', 'Benelli',
        'Aprilia', 'Husqvarna', 'Ola', 'Ather', 'Revolt', 'Ultraviolette', 'Tork',
        'Vespa', 'Norton', 'MV Agusta', 'Indian', 'Zontes', 'Ampere', 'Okinawa',
        'Bounce', 'Yezdi', 'BSA'
    ];

    const getLogo = (brandName) => {
        // Use mapped logo or generic fallback based on name
        if (brandLogoMap[brandName]) {
            return brandLogoMap[brandName];
        }

        // Check for partial matches or alternative naming conventions
        const normalized = brandName.toLowerCase();
        for (const [key, value] of Object.entries(brandLogoMap)) {
            if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
                return value;
            }
        }

        // Generic fallback using UI Avatars with transparent background settings
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(brandName)}&background=f0f0f0&color=333&size=128&bold=true`;
    };

    useEffect(() => {
        const fetchBrandStats = async () => {
            try {
                const response = await api.get('/vehicles/meta/brand-stats');
                if (response.success) {
                    const { cars, bikes } = response.data;

                    setCarBrands(ALL_CAR_BRANDS.map(name => {
                        const stat = cars.find(c => c.name.toLowerCase() === name.toLowerCase());
                        return {
                            name: name,
                            logo: getLogo(name),
                            count: stat ? `${stat.count} Models` : '0 Models'
                        };
                    }));

                    setBikeBrands(ALL_BIKE_BRANDS.map(name => {
                        const stat = bikes.find(b => b.name.toLowerCase() === name.toLowerCase());
                        return {
                            name: name,
                            logo: getLogo(name),
                            count: stat ? `${stat.count} Models` : '0 Models'
                        };
                    }));
                }
            } catch (error) {
                console.error('Failed to load brand stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBrandStats();
    }, []);

    const handleBrandClick = (brandName, vehicleType) => {
        navigate(`/vehicles?type=${vehicleType}&brand=${encodeURIComponent(brandName)}`);
    };

    return (
        <section className="brand-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">
                        Explore Brands
                    </h2>
                    <p className="section-subtitle">
                        Explore vehicles from your favorite manufacturers
                    </p>
                </div>

                {/* Car Brands Section */}
                <div className="brand-category">
                    <h3 className="brand-category-title">🚗 Car Brands</h3>
                    <div className="brand-grid">
                        {(expandedCars ? carBrands : carBrands.slice(0, 10)).map((brand, index) => (
                            <div
                                key={`car-${index}`}
                                className="brand-card"
                                onClick={() => handleBrandClick(brand.name, 'car')}
                            >
                                <div className="brand-logo">
                                    <img
                                        src={brand.logo}
                                        alt={`${brand.name} logo`}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=random&color=fff&size=128&bold=true`;
                                        }}
                                    />
                                </div>
                                <h4 className="brand-name">{brand.name}</h4>
                                <p className="brand-count">{brand.count}</p>
                            </div>
                        ))}
                    </div>
                    {carBrands.length > 10 && (
                        <div className="section-actions">
                            <button
                                className="btn-view-all-brands"
                                onClick={() => setExpandedCars(!expandedCars)}
                            >
                                {expandedCars ? 'Less Brands' : 'More Brands'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Bike Brands Section */}
                <div className="brand-category">
                    <h3 className="brand-category-title">🏍️ Bike Brands</h3>
                    <div className="brand-grid">
                        {(expandedBikes ? bikeBrands : bikeBrands.slice(0, 10)).map((brand, index) => (
                            <div
                                key={`bike-${index}`}
                                className="brand-card"
                                onClick={() => handleBrandClick(brand.name, 'bike')}
                            >
                                <div className="brand-logo">
                                    <img
                                        src={brand.logo}
                                        alt={`${brand.name} logo`}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=random&color=fff&size=128&bold=true`;
                                        }}
                                    />
                                </div>
                                <h4 className="brand-name">{brand.name}</h4>
                                <p className="brand-count">{brand.count}</p>
                            </div>
                        ))}
                    </div>
                    {bikeBrands.length > 10 && (
                        <div className="section-actions">
                            <button
                                className="btn-view-all-brands"
                                onClick={() => setExpandedBikes(!expandedBikes)}
                            >
                                {expandedBikes ? 'Less Brands' : 'More Brands'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default BrandGrid;
