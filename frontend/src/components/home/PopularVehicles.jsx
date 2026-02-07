import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../../context/VehicleContext.jsx';
import api from '../../services/api.js';
import './PopularVehicles.css';

function PopularVehicles() {
    const navigate = useNavigate();
    const { vehicleType } = useVehicle();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPopularVehicles();
    }, []); // Load once, ignore vehicleType toggle for this section

    const loadPopularVehicles = async () => {
        try {
            setLoading(true);
            // Fetch mixed vehicles (remove type filter)
            const response = await api.get(`/vehicles?limit=8&sortBy=rating`);
            setVehicles(response.data || []);
        } catch (error) {
            console.error('Failed to load popular vehicles:', error);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="popular-section">
                <div className="container">
                    <h2 className="section-title">Loading...</h2>
                </div>
            </section>
        );
    }

    return (
        <section className="popular-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">
                        Popular Vehicles
                    </h2>
                    <button
                        className="view-all-btn"
                        onClick={() => navigate('/popular-vehicles')}
                    >
                        View All →
                    </button>
                </div>

                <div className="vehicle-grid">
                    {vehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="vehicle-card"
                            onClick={() => navigate(`/vehicles/${vehicle.slug}`)}
                        >
                            <div className="vehicle-image">
                                {vehicle.images && (vehicle.images.exterior?.length > 0 || vehicle.images.all?.length > 0) ? (
                                    <img
                                        src={vehicle.images.exterior?.[0] || vehicle.images.all?.[0]}
                                        alt={`${vehicle.brand} ${vehicle.model}`}
                                        className="actual-vehicle-image"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className="image-placeholder" style={{ display: (vehicle.images?.exterior?.length > 0 || vehicle.images?.all?.length > 0) ? 'none' : 'flex' }}>
                                    <span className="placeholder-icon">
                                        {vehicle.type === 'car' ? '🚗' : '🏍️'}
                                    </span>
                                </div>
                                <div className="brand-logo-badge">
                                    {vehicle.brand}
                                </div>
                                <div className="rating-badge">
                                    ★ {vehicle.rating || '4.5'}
                                </div>
                            </div>

                            <div className="vehicle-details">
                                <h3 className="vehicle-brand">{vehicle.brand}</h3>
                                <h4 className="vehicle-model">{vehicle.model}</h4>

                                <div className="vehicle-price">
                                    ₹ {(vehicle.price / 100000).toFixed(2)} Lakh
                                </div>

                                <div className="vehicle-specs">
                                    <span className="spec">⛽ {vehicle.specs?.fuelType}</span>
                                    {vehicle.specs?.mileage > 0 && (
                                        <span className="spec">📏 {vehicle.specs?.mileage} km/l</span>
                                    )}
                                </div>

                                <button className="btn-view-details">View Details</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default PopularVehicles;
