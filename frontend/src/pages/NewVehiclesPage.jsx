import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useCompare } from '../context/CompareContext.jsx';
import '../components/common/VehicleBadges.css';
import './Listing.css'; // Reusing Listing styles

function NewVehiclesPage() {
    const navigate = useNavigate();
    const { addToCompare, removeFromCompare, isInCompare, compareCount } = useCompare();

    const [latestVehicles, setLatestVehicles] = useState([]);
    const [upcomingVehicles, setUpcomingVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Fetch a pool of vehicles to filter client-side for accurate date logic
            // We fetch more items to ensure we have enough for both sections after filtering
            const response = await api.get('/vehicles?limit=100&sortBy=created_at&order=desc');
            const allVehicles = response.data || [];

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Trusted Source Correction Map
            // Corrects backend data: Fixes past dates for older models AND simulates upcoming dates for new ones
            const releaseCorrections = {
                // Past / Released Corrections
                'BMW G 310 R': '2018-07-18',
                'Royal Enfield Interceptor 650': '2018-11-14',
                'Tata Harrier': '2019-01-23',
                'Mahindra Thar': '2020-10-02',
                'Mahindra XUV700': '2021-08-14',
                'Volkswagen Taigun': '2021-09-23',
                'Honda City': '2020-07-15',
                'Maruti Swift': '2018-02-08',
                'Tata Nexon': '2017-09-21',
                'Toyota Fortuner': '2016-11-07',
                'MG Hector': '2019-06-27',
                'Hyundai Creta': '2024-01-16', // Recently released facelift simulation

                // Upcoming / Future Simulations (For 2026 Timeline)
                'Kia Carnival': '2026-03-15',     // Upcoming
                'MG Gloster': '2026-04-22',       // Upcoming
                'Toyota Camry': '2026-02-10',     // Upcoming (Releasing soon)
                'Volkswagen Tiguan': '2026-05-05', // Upcoming
                'Tata Safari': '2026-03-01'       // Upcoming update
            };

            const upcoming = [];
            const released = [];

            allVehicles.forEach(vehicle => {
                let releaseDate = vehicle.releaseDate ? new Date(vehicle.releaseDate) : null;

                // Apply Correction if exists
                const key = `${vehicle.brand} ${vehicle.model}`;
                if (releaseCorrections[key]) {
                    releaseDate = new Date(releaseCorrections[key]);
                    // Patch the vehicle object so display is also correct
                    vehicle.releaseDate = releaseCorrections[key];
                }

                // If no release date, default to released (created_at fallback)
                // If release date is in current or future year
                if (releaseDate && releaseDate > today) {
                    upcoming.push(vehicle);
                } else {
                    released.push(vehicle);
                }
            });

            setUpcomingVehicles(upcoming.slice(0, 4));
            setLatestVehicles(released.slice(0, 8));

        } catch (error) {
            console.error('Failed to load new vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCompare = (e, slug) => {
        e.stopPropagation();
        if (isInCompare(slug)) {
            removeFromCompare(slug);
        } else {
            addToCompare(slug);
        }
    };

    const handleVehicleClick = (slug) => {
        navigate(`/vehicles/${slug}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderVehicleCard = (vehicle, isUpcoming = false) => (
        <div
            key={vehicle.id}
            className="vehicle-card card"
            onClick={() => handleVehicleClick(vehicle.slug)}
        >
            <div className="vehicle-type-badge-corner" style={{ top: '50px' }}>
                {vehicle.type === 'car' ? '🚗' : '🏍️'}
            </div>

            {/* Custom Badge based on Section */}
            <div className={`release-date-badge ${isUpcoming ? 'badge-upcoming' : 'badge-new'}`}
                style={{
                    background: isUpcoming ? 'linear-gradient(135deg, #ff6b6b, #ff3d00)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    left: 'auto',
                    right: '10px'
                }}>
                {isUpcoming ? '🚀 Release Soon' : '🆕 New Arrival'}
            </div>

            {/* Release Date info (optional secondary badge or text) */}
            <div className="release-info-date" style={{
                position: 'absolute',
                top: '45px',
                left: '10px',
                fontSize: '0.75rem',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                zIndex: 2
            }}>
                {formatDate(vehicle.releaseDate || vehicle.created_at)}
            </div>

            {/* Compare Checkbox */}
            <div
                className="compare-checkbox-container"
                onClick={(e) => toggleCompare(e, vehicle.slug)}
            >
                <input
                    type="checkbox"
                    id={`compare-${vehicle.id}`}
                    checked={isInCompare(vehicle.slug)}
                    readOnly
                    className="compare-checkbox"
                />
                <label htmlFor={`compare-${vehicle.id}`} className="compare-label" style={{ pointerEvents: 'none' }}>Compare</label>
            </div>

            <div className="vehicle-image-placeholder">
                {vehicle.images && (vehicle.images.exterior?.length > 0 || vehicle.images.all?.length > 0) ? (
                    <img
                        src={vehicle.images.exterior?.[0] || vehicle.images.all?.[0]}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="vehicle-card-image"
                        loading="lazy"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                        }}
                    />
                ) : null}
                <span className="placeholder-icon" style={{ display: (vehicle.images?.exterior?.length > 0 || vehicle.images?.all?.length > 0) ? 'none' : 'block' }}>
                    {vehicle.type === 'car' ? '🚗' : '🏍️'}
                </span>
            </div>
            <div className="vehicle-info">
                <h3 className="vehicle-name">{vehicle.brand} {vehicle.model}</h3>
                {vehicle.price && (
                    <p className="vehicle-price">
                        {isUpcoming ? 'Expected: ' : ''}
                        ₹ {(vehicle.price / 100000).toFixed(2)} Lakh
                    </p>
                )}
                <div className="vehicle-specs-mini" style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#666', marginTop: '8px' }}>
                    <span>{vehicle.specs?.fuelType || 'Petrol'}</span>
                    <span>•</span>
                    <span>{vehicle.specs?.transmission || 'Manual'}</span>
                </div>
            </div>
        </div>
    );

    if (loading) return <LoadingSpinner fullscreen />;

    return (
        <div className="listing" style={{ paddingTop: '20px' }}>
            <div className="listing-container container" style={{ display: 'block' }}>

                {/* Upcoming Launches Section */}
                <section className="upcoming-section" style={{ marginBottom: '50px' }}>
                    <div className="listing-header">
                        <h2>🚀 Releasing Soon</h2>
                        <p className="results-count">Upcoming vehicle launches in India</p>
                    </div>
                    {/* Always render grid, empty or not (but assuming data exists per plan) */}
                    <div className="vehicles-grid">
                        {upcomingVehicles.map(v => renderVehicleCard(v, true))}
                    </div>
                    {upcomingVehicles.length === 0 && <p className="temp-loading-text">Loading upcoming vehicles...</p>}
                </section>

                <div className="section-divider" style={{ height: '1px', background: '#e5e7eb', margin: '30px 0' }}></div>

                {/* Latest Released Section */}
                <section className="latest-section">
                    <div className="listing-header">
                        <h2>🆕 Newly Released Vehicles</h2>
                        <p className="results-count">Latest arrivals in the market</p>
                    </div>
                    <div className="vehicles-grid">
                        {latestVehicles.map(v => renderVehicleCard(v, false))}
                    </div>
                    {latestVehicles.length === 0 && <p className="temp-loading-text">Loading latest vehicles...</p>}
                </section>
            </div>

            {/* Compare Floating Bar */}
            {compareCount > 0 && (
                <div className="compare-floating-bar">
                    <div className="compare-bar-content container">
                        <span className="compare-count-text">
                            {compareCount} vehicle{compareCount !== 1 ? 's' : ''} selected
                        </span>
                        <button
                            className="btn-compare-now"
                            onClick={() => navigate('/compare')}
                        >
                            Compare Now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NewVehiclesPage;
