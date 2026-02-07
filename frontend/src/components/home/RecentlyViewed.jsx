import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecentlyViewed.css';

function RecentlyViewed() {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [recentVehicles, setRecentVehicles] = useState([]);

    useEffect(() => {
        // Load from localStorage
        const stored = localStorage.getItem('autoverse_recently_viewed');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setRecentVehicles(parsed.slice(0, 4));
            } catch (error) {
                console.error('Error loading recent vehicles:', error);
            }
        }
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (recentVehicles.length === 0) {
        return null;
    }

    return (
        <section className="recently-viewed-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">
                        🕒 Recently Viewed
                    </h2>
                    <div className="scroll-controls">
                        <button className="scroll-btn" onClick={() => scroll('left')}>‹</button>
                        <button className="scroll-btn" onClick={() => scroll('right')}>›</button>
                    </div>
                </div>

                <div className="recently-viewed-carousel" ref={scrollRef}>
                    {recentVehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="recent-card"
                            onClick={() => navigate(`/vehicles/${vehicle.slug}`)}
                        >
                            <div className="recent-image">
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
                            </div>
                            <div className="recent-info">
                                <h4>{vehicle.brand} {vehicle.model}</h4>
                                <p className="recent-price">
                                    ₹ {(vehicle.price / 100000).toFixed(2)} L
                                </p>
                                <button className="btn-view-again">View Again</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default RecentlyViewed;
