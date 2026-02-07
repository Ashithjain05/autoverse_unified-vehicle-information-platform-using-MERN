import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { useCompare } from '../context/CompareContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import '../components/common/VehicleBadges.css';
import './Listing.css';

const PRICE_OPTIONS = [
    { value: 100000, label: '₹1 Lakh' },
    { value: 200000, label: '₹2 Lakh' },
    { value: 300000, label: '₹3 Lakh' },
    { value: 500000, label: '₹5 Lakh' },
    { value: 800000, label: '₹8 Lakh' },
    { value: 1000000, label: '₹10 Lakh' },
    { value: 1500000, label: '₹15 Lakh' },
    { value: 2000000, label: '₹20 Lakh' },
    { value: 2500000, label: '₹25 Lakh' },
    { value: 3500000, label: '₹35 Lakh' },
    { value: 5000000, label: '₹50 Lakh' },
    { value: 7500000, label: '₹75 Lakh' },
    { value: 10000000, label: '₹1 Crore' },
    { value: 20000000, label: '₹2 Crore' },
    { value: 50000000, label: '₹5 Crore' },
];

const Listing = ({ initialFilterType = 'all', initialCondition = '' }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize filters from URL parameters or props
    const [filters, setFilters] = useState({
        priceMin: searchParams.get('priceMin') || '',
        priceMax: searchParams.get('priceMax') || '',
        fuelType: searchParams.get('fuelType') || '',
        brand: searchParams.get('brand') || '',
        type: searchParams.get('type') || initialFilterType,
        condition: initialCondition
    });

    const [brands, setBrands] = useState([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 1000, // Show all vehicles (effectively no limit)
        total: 0,
        totalPages: 0
    });

    // Update filters when URL params or props change
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            priceMin: searchParams.get('priceMin') || '',
            priceMax: searchParams.get('priceMax') || '',
            fuelType: searchParams.get('fuelType') || '',
            brand: searchParams.get('brand') || '',
            type: searchParams.get('type') || initialFilterType,
            condition: initialCondition
        }));
    }, [searchParams, initialFilterType, initialCondition]);

    useEffect(() => {
        loadVehicles();
        loadBrands();
    }, [filters, pagination.page]);

    const loadVehicles = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                type: filters.type,
                page: pagination.page,
                limit: pagination.limit,
                ...Object.fromEntries(Object.entries(filters).filter(([k, v]) => v && k !== 'type'))
            });

            const response = await api.get(`/vehicles?${params}`);
            // axios interceptor returns response.data
            setVehicles(response.data || []);
            setPagination(prev => ({ ...prev, ...response.pagination }));
        } catch (error) {
            console.error('Failed to load vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBrands = async () => {
        try {
            // Pass 'all' explicitly if filters.type is 'all' or empty
            const type = filters.type || 'all';
            const response = await api.get(`/vehicles/meta/brands?type=${type}`);
            setBrands(response.data || []);
        } catch (error) {
            console.error('Failed to load brands:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            priceMin: '',
            priceMax: '',
            fuelType: '',
            brand: ''
        });
    };

    const handleVehicleClick = (slug) => {
        navigate(`/vehicles/${slug}`);
    };

    const { addToCompare, removeFromCompare, isInCompare, compareCount, compareList } = useCompare();

    const toggleCompare = (e, slug) => {
        e.stopPropagation(); // Prevent card click
        if (isInCompare(slug)) {
            removeFromCompare(slug);
        } else {
            addToCompare(slug);
        }
    };

    return (
        <div className="listing">

            <div className="listing-container container">
                {/* Filters Sidebar */}
                <aside className={`filters-sidebar ${showMobileFilters ? 'show-mobile' : ''}`}>
                    <div className="filters-header">
                        <h3>Filters</h3>
                        <div className="filter-header-actions">
                            <button onClick={clearFilters} className="clear-filters">Clear All</button>
                            <button
                                className="close-filters-mobile"
                                onClick={() => setShowMobileFilters(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Brand</label>
                        <select
                            value={filters.brand}
                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                        >
                            <option value="">All Brands</option>
                            {brands.map((brandObj) => {
                                // Handle both old string format (fallback) and new object format
                                const name = typeof brandObj === 'string' ? brandObj : brandObj.name;
                                const types = typeof brandObj === 'string' ? [] : brandObj.types;

                                let label = name;
                                if (types && types.length > 0) {
                                    const hasCar = types.includes('car');
                                    const hasBike = types.includes('bike');

                                    if (hasCar && hasBike) label = `${name} – Car & Bike`;
                                    else if (hasCar) label = `${name} – Car`;
                                    else if (hasBike) label = `${name} – Bike`;
                                }

                                return (
                                    <option key={name} value={name}>{label}</option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Price Range (₹)</label>
                        <div className="price-inputs">
                            <select
                                value={filters.priceMin}
                                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                            >
                                <option value="">Min Price</option>
                                {PRICE_OPTIONS.map(option => (
                                    <option key={`min-${option.value}`} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <span>-</span>
                            <select
                                value={filters.priceMax}
                                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                            >
                                <option value="">Max Price</option>
                                {PRICE_OPTIONS.map(option => (
                                    <option key={`max-${option.value}`} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Fuel Type</label>
                        <select
                            value={filters.fuelType}
                            onChange={(e) => handleFilterChange('fuelType', e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Vehicle Type</label>
                        <div className="type-filters">
                            <button
                                className={`type-btn ${filters.type === 'all' ? 'active' : ''}`}
                                onClick={() => handleFilterChange('type', 'all')}
                            >
                                All Vehicles
                            </button>
                            <button
                                className={`type-btn ${filters.type === 'car' ? 'active' : ''}`}
                                onClick={() => handleFilterChange('type', 'car')}
                            >
                                🚗 Cars
                            </button>
                            <button
                                className={`type-btn ${filters.type === 'bike' ? 'active' : ''}`}
                                onClick={() => handleFilterChange('type', 'bike')}
                            >
                                🏍️ Bikes
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Vehicles Grid */}
                <div className="vehicles-content">
                    <div className="listing-header">
                        <div className="header-title-row">
                            <h2>Vehicles for Sale</h2>
                            <button
                                className="mobile-filter-toggle"
                                onClick={() => setShowMobileFilters(true)}
                            >
                                🌪️ Filters
                            </button>
                        </div>
                        <p className="results-count">
                            {pagination.total} vehicles found
                        </p>
                    </div>

                    {loading ? (
                        <div className="loading-center">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <>
                            <div className="vehicles-grid">
                                {vehicles.map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className="vehicle-card card"
                                        onClick={() => handleVehicleClick(vehicle.slug)}
                                    >
                                        <div className="vehicle-type-badge-corner">
                                            {vehicle.type === 'car' ? '🚗' : '🏍️'}
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
                                                <p className="vehicle-price">₹ {(vehicle.price / 100000).toFixed(2)} Lakh</p>
                                            )}
                                            {vehicle.familyFriendly && (
                                                <span className="family-badge-small">👨‍👩‍👧‍👦 Family</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="pagination-btn"
                                    >
                                        Previous
                                    </button>
                                    <span className="pagination-info">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="pagination-btn"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
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

export default Listing;
