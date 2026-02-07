import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import '../common/VehicleBadges.css';
import './TrendingSection.css';

function TrendingSection() {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [trendingVehicles, setTrendingVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTrendingVehicles();
    }, []);

    const loadTrendingVehicles = async () => {
        try {
            setLoading(true);
            const response = await api.get('/vehicles/trending/all?limit=12');
            setTrendingVehicles(response.data);
        } catch (error) {
            console.error('Failed to load trending vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 320;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    const checkScroll = () => {
        if (scrollRef.current) {
            setCanScrollLeft(scrollRef.current.scrollLeft > 0);
            setCanScrollRight(
                scrollRef.current.scrollLeft <
                scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
            );
        }
    };

    useEffect(() => {
        checkScroll();
    }, [trendingVehicles]);

    const getTrendingTag = (index) => {
        const tags = ['🔥 Hot', '⚡ New', '💫 Popular'];
        return tags[index % tags.length];
    };

    if (loading || trendingVehicles.length === 0) {
        return null;
    }

    return (
        <section className="trending-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">
                        🔥 Trending Vehicles
                    </h2>
                    <p className="section-subtitle">Discover what's hot in cars and bikes</p>
                </div>

                <div className="trending-carousel-container">
                    <div
                        className="trending-carousel"
                        ref={scrollRef}
                        onScroll={checkScroll}
                    >
                        {trendingVehicles.map((vehicle, index) => (
                            <div
                                key={vehicle.id}
                                className="trending-card"
                                onClick={() => navigate(`/vehicles/${vehicle.slug}`)}
                            >
                                <div className="trending-tag">{getTrendingTag(index)}</div>
                                <div className="vehicle-type-badge">
                                    {vehicle.type === 'car' ? '🚗 Car' : '🏍️ Bike'}
                                </div>
                                <div className="trending-image">
                                    <span className="placeholder-icon">
                                        {vehicle.type === 'car' ? '🚗' : '🏍️'}
                                    </span>
                                </div>
                                <div className="trending-info">
                                    <h4>{vehicle.brand} {vehicle.model}</h4>
                                    {vehicle.price && (
                                        <p className="trending-price">
                                            ₹ {(vehicle.price / 100000).toFixed(2)} L
                                        </p>
                                    )}
                                    {vehicle.familyFriendly && (
                                        <span className="family-badge">👨‍👩‍👧‍👦 Family Friendly</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TrendingSection;

