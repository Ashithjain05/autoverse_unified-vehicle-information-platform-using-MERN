import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext.jsx';
import './Compare.css';

import api from '../services/api.js';

function Compare() {
    const navigate = useNavigate();
    const { compareList, removeFromCompare, clearCompare } = useCompare();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (compareList.length === 0) {
            setLoading(false);
            return;
        }

        // Fetch vehicle details for comparison
        const fetchVehicles = async () => {
            try {
                const vehiclePromises = compareList.map(slug =>
                    api.get(`/vehicles/${slug}`)
                );
                const responses = await Promise.allSettled(vehiclePromises);
                const successfulVehicles = responses
                    .filter(r => r.status === 'fulfilled')
                    .map(r => r.value.data); // api interceptor returns body, so r.value is { success, data: vehicle }

                setVehicles(successfulVehicles);
            } catch (error) {
                console.error('Error fetching vehicles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, [compareList]);

    if (loading) {
        return (
            <div className="compare-page">
                <div className="compare-container">
                    <div className="loading">Loading comparison...</div>
                </div>
            </div>
        );
    }

    if (compareList.length === 0) {
        return (
            <div className="compare-page">
                <div className="compare-container">
                    <div className="compare-empty">
                        <div className="empty-icon">🔍</div>
                        <h2>No Vehicles to Compare</h2>
                        <p>Add vehicles from the listing page to compare their features</p>
                        <button onClick={() => navigate('/vehicles')} className="btn-primary">
                            Browse Vehicles
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const specs = [
        { key: 'price', label: 'Price', format: (v) => `₹${(v / 100000).toFixed(2)}L` },
        { key: 'fuelType', label: 'Fuel Type', path: 'specs.fuelType' },
        { key: 'transmission', label: 'Transmission', path: 'specs.transmission' },
        { key: 'mileage', label: 'Mileage', path: 'specs.mileage', format: (v) => `${v} km/l` },
        { key: 'engine', label: 'Engine', path: 'specs.engine' },
        { key: 'power', label: 'Power', path: 'specs.power' },
    ];

    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    return (
        <div className="compare-page">
            <div className="compare-container">
                <div className="compare-header">
                    <h1>Compare Vehicles</h1>
                    <button onClick={clearCompare} className="btn-clear-all">
                        Clear All
                    </button>
                </div>

                <div className="compare-grid">
                    {vehicles.map((vehicle) => (
                        <div key={vehicle.slug} className="compare-card">
                            <button
                                className="remove-btn"
                                onClick={() => removeFromCompare(vehicle.slug)}
                                aria-label="Remove from comparison"
                            >
                                ✕
                            </button>

                            <div className="vehicle-type-badge-compare">
                                {vehicle.type === 'car' ? '🚗 Car' : '🏍️ Bike'}
                            </div>

                            <div className="vehicle-image">
                                {vehicle.images && (vehicle.images.exterior?.length > 0 || vehicle.images.all?.length > 0) ? (
                                    <img
                                        src={vehicle.images.exterior?.[0] || vehicle.images.all?.[0]}
                                        alt={`${vehicle.brand} ${vehicle.model}`}
                                        className="compare-vehicle-image"
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
                                <h3>{vehicle.brand}</h3>
                                <h2>{vehicle.model}</h2>
                                <div className="rating">
                                    ★ {vehicle.rating || 'N/A'}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Fill empty slots */}
                    {[...Array(3 - vehicles.length)].map((_, idx) => (
                        <div key={`empty-${idx}`} className="compare-card empty">
                            <div className="add-vehicle">
                                <div className="add-icon">+</div>
                                <p>Add Vehicle</p>
                                <button
                                    onClick={() => navigate('/vehicles')}
                                    className="btn-browse"
                                >
                                    Browse
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="compare-table">
                    <h3>Specifications Comparison</h3>
                    <table>
                        <tbody>
                            {specs.map((spec) => (
                                <tr key={spec.key}>
                                    <td className="spec-label">{spec.label}</td>
                                    {vehicles.map((vehicle) => {
                                        const value = spec.path
                                            ? getNestedValue(vehicle, spec.path)
                                            : vehicle[spec.key];
                                        return (
                                            <td key={vehicle.slug} className="spec-value">
                                                {spec.format ? spec.format(value) : value || 'N/A'}
                                            </td>
                                        );
                                    })}
                                    {/* Fill empty cells */}
                                    {[...Array(3 - vehicles.length)].map((_, idx) => (
                                        <td key={`empty-${idx}`} className="spec-value empty">
                                            -
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="compare-actions">
                    {vehicles.map((vehicle) => (
                        <button
                            key={vehicle.slug}
                            onClick={() => navigate(`/${vehicle.type}s/${vehicle.slug}`)}
                            className="btn-view-details"
                        >
                            View Details
                        </button>
                    ))}
                    {[...Array(3 - vehicles.length)].map((_, idx) => (
                        <div key={`empty-${idx}`} className="empty-action"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Compare;
