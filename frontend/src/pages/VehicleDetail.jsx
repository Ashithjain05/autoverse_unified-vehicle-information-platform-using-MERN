import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import OTPModal from '../components/auth/OTPModal.jsx';
import EMICalculator from '../components/detail/EMICalculator.jsx';
import VehicleProsCons from '../components/detail/VehicleProsCons.jsx';
import ShowroomContact from '../components/detail/ShowroomContact.jsx';
import VehicleImageGallery from '../components/detail/VehicleImageGallery.jsx';
import { FaCar, FaMotorcycle, FaStar, FaUserFriends, FaRupeeSign } from 'react-icons/fa';
import './VehicleDetail.css';

function VehicleDetail() {
    const { slug } = useParams();
    const { isAuthenticated } = useAuth();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState('Mumbai');
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [showrooms, setShowrooms] = useState([]);

    useEffect(() => {
        loadVehicle();
    }, [slug]);

    useEffect(() => {
        if (vehicle) {
            loadShowrooms();
            addToRecentlyViewed(vehicle);
        }
    }, [vehicle, selectedCity]);

    const addToRecentlyViewed = (currentVehicle) => {
        try {
            const stored = localStorage.getItem('autoverse_recently_viewed');
            let recent = stored ? JSON.parse(stored) : [];

            // Remove if already exists (to move to top)
            recent = recent.filter(v => v.id !== currentVehicle.id);

            // Add new vehicle to the beginning
            const vehicleData = {
                id: currentVehicle.id,
                brand: currentVehicle.brand,
                model: currentVehicle.model,
                slug: currentVehicle.slug,
                price: currentVehicle.price,
                type: currentVehicle.type,
                images: currentVehicle.images, // Save images for display
                viewedAt: new Date().toISOString()
            };

            recent.unshift(vehicleData);

            // Keep only last 10
            if (recent.length > 10) {
                recent = recent.slice(0, 10);
            }

            localStorage.setItem('autoverse_recently_viewed', JSON.stringify(recent));
        } catch (error) {
            console.error('Failed to update recently viewed:', error);
        }
    };

    const loadVehicle = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/vehicles/${slug}`);
            setVehicle(response.data);
        } catch (error) {
            console.error('Failed to load vehicle:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadShowrooms = async () => {
        try {
            // Pass brand to filter correct showrooms
            const response = await api.get(`/showrooms?brand=${encodeURIComponent(vehicle.brand)}&city=${selectedCity}`);
            setShowrooms(response.data);
        } catch (error) {
            console.error('Failed to load showrooms:', error);
        }
    };

    const handleSaveVehicle = async () => {
        if (!isAuthenticated()) {
            setShowOTPModal(true);
            return;
        }

        try {
            await api.post('/leads', {
                vehicleId: vehicle.id,
                type: 'save'
            });
            alert('Vehicle saved successfully!');
        } catch (error) {
            console.error('Failed to save vehicle:', error);
            alert('Failed to save vehicle');
        }
    };

    if (loading) {
        return <LoadingSpinner fullscreen />;
    }

    if (!vehicle) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Vehicle not found</h2>
            </div>
        );
    }

    const cityPrice = vehicle.city_prices[selectedCity] || vehicle.price;
    const cities = Object.keys(vehicle.city_prices);

    return (
        <div className="vehicle-detail">
            {/* Hero Section */}
            <section className="detail-hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {/* Brand Logo Display - Prominent */}
                            {vehicle.brandLogo && (
                                <img
                                    src={vehicle.brandLogo}
                                    alt={`${vehicle.brand} Logo`}
                                    className="hero-brand-logo"
                                    style={{ height: '50px', objectFit: 'contain' }} // Increased size
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            )}
                            {/* Model Name Only (Brand Name removed as per request) */}
                            <h1 className="vehicle-title" style={{ margin: 0 }}>{vehicle.model}</h1>
                        </div>

                        <div className="vehicle-meta">


                            <span className="vehicle-type-badge">
                                {vehicle.type === 'car' ? <><FaCar /> Car</> : <><FaMotorcycle /> Bike</>}
                            </span>
                            {vehicle.rating && (
                                <span className="vehicle-rating"><FaStar className="rating-star" /> {vehicle.rating} Rating</span>
                            )}
                            {vehicle.familyFriendly && (
                                <span className="family-badge"><FaUserFriends /> Family Friendly</span>
                            )}
                            <span className="vehicle-price-hero"><FaRupeeSign /> {(cityPrice / 100000).toFixed(2)} Lakh</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Interactive Image Gallery */}
            <section className="section">
                <div className="container">
                    <VehicleImageGallery vehicle={vehicle} />
                </div>
            </section>

            {/* Price Breakdown */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Price Breakdown</h2>

                    <div className="city-price-card">
                        {/* Header Row: Price (Left) & Selector (Right) */}
                        <div className="price-header-row">
                            <div className="price-info-left">
                                <span className="price-label-small">On-road price in {selectedCity}</span>
                                <span className="price-value-main">₹ {(cityPrice / 100000).toFixed(2)} Lakh</span>
                            </div>

                            <div className="city-selector-right">
                                <span className="city-selector-label">Price by City</span>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="city-select-input"
                                >
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="card-divider"></div>

                        {/* Detailed Breakup */}
                        <div className="price-breakup-compact">
                            <h3 className="breakup-section-title">Detailed Price Breakup</h3>
                            <div className="breakup-table">
                                <div className="breakup-row">
                                    <span className="row-label">Ex-Showroom Price</span>
                                    <span className="row-value">₹ {Math.round(cityPrice / 1.17).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="breakup-row">
                                    <span className="row-label">RTO Charges (10%)</span>
                                    <span className="row-value">₹ {Math.round((cityPrice / 1.17) * 0.10).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="breakup-row">
                                    <span className="row-label">Insurance (5%)</span>
                                    <span className="row-value">₹ {Math.round((cityPrice / 1.17) * 0.05).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="breakup-row">
                                    <span className="row-label">Other Charges (2%)</span>
                                    <span className="row-value">₹ {Math.round((cityPrice / 1.17) * 0.02).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="breakup-divider-line"></div>
                                <div className="breakup-row total-row-compact">
                                    <span className="row-label-valid">Total On-Road Price</span>
                                    <span className="row-value-total">₹ {cityPrice.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Specifications */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Features & Specifications</h2>
                    <div className="specs-grid">
                        {Object.entries(vehicle.specs).map(([key, value]) => (
                            <div key={key} className="spec-item">
                                <span className="spec-label">
                                    {key.replace(/_/g, ' ') // Replace underscores with spaces
                                        .replace(/([A-Z])/g, ' $1') // Handle camelCase
                                        .replace(/^./, str => str.toUpperCase())} {/* Capitalize first letter */}
                                </span>
                                <span className="spec-value">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pros & Cons - New Component */}
            <section className="section">
                <div className="container">
                    <VehicleProsCons prosCons={vehicle.pros_cons} />
                </div>
            </section>

            {/* EMI Calculator */}
            <EMICalculator
                vehiclePrice={cityPrice}
                isAuthenticated={isAuthenticated()}
                onLoginClick={() => setShowOTPModal(true)}
            />

            {/* Showrooms - New Component */}
            <section className="section">
                <div className="container">
                    <ShowroomContact showrooms={showrooms} vehicleName={vehicle.model} />
                </div>
            </section>

            {/* Contact Actions */}
            <section className="section">
                <div className="container">
                    <div className="contact-actions">
                        <button onClick={handleSaveVehicle} className="btn btn-outline">
                            ❤️ Save Vehicle
                        </button>
                        <button className="btn btn-primary">
                            📩 Request Callback
                        </button>
                    </div>
                </div>
            </section>

            {/* OTP Modal */}
            {showOTPModal && (
                <OTPModal onClose={() => setShowOTPModal(false)} />
            )}
        </div>
    );
}

export default VehicleDetail;
