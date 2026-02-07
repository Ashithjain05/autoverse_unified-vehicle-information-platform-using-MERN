import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../../context/VehicleContext.jsx';
import './UpcomingVehicles.css';

function UpcomingVehicles() {
    const navigate = useNavigate();
    const { vehicleType } = useVehicle();

    const upcomingCars = [
        { id: 1, brand: 'Tata', model: 'Harrier EV', slug: 'tata-harrier-ev', price: 2500000, launchDate: 'Mar 2024', status: 'Coming Soon' },
        { id: 2, brand: 'Mahindra', model: 'XUV900', slug: 'mahindra-xuv900', price: 2800000, launchDate: 'Apr 2024', status: 'Pre-booking' },
        { id: 3, brand: 'Maruti', model: 'Jimny 5-Door', slug: 'maruti-jimny-5-door', price: 1200000, launchDate: 'Feb 2024', status: 'Coming Soon' },
        { id: 4, brand: 'Hyundai', model: 'Ioniq 5', slug: 'hyundai-ioniq-5', price: 4500000, launchDate: 'May 2024', status: 'Pre-booking' },
    ];

    const upcomingBikes = [
        { id: 5, brand: 'Royal Enfield', model: 'Himalayan 450', slug: 'royal-enfield-himalayan-450', price: 280000, launchDate: 'Mar 2024', status: 'Coming Soon' },
        { id: 6, brand: 'Hero', model: 'Mavrick 440', slug: 'hero-mavrick-440', price: 220000, launchDate: 'Feb 2024', status: 'Pre-booking' },
        { id: 7, brand: 'TVS', model: 'Ronin 250', slug: 'tvs-ronin-250', price: 180000, launchDate: 'Apr 2024', status: 'Coming Soon' },
        { id: 8, brand: 'Bajaj', model: 'Pulsar NS400', slug: 'bajaj-pulsar-ns400', price: 240000, launchDate: 'May 2024', status: 'Pre-booking' },
    ];

    const vehicles = vehicleType === 'car' ? upcomingCars : upcomingBikes;

    return (
        <section className="upcoming-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">
                        🚀 Upcoming {vehicleType === 'car' ? 'Cars' : 'Bikes'}
                    </h2>
                    <p className="section-subtitle">
                        Get notified about the latest launches
                    </p>
                </div>

                <div className="upcoming-grid">
                    {vehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="upcoming-card"
                            onClick={() => vehicle.slug && navigate(`/vehicles/${vehicle.slug}`)}
                            style={{ cursor: vehicle.slug ? 'pointer' : 'default' }}
                        >
                            <div className="upcoming-badge">{vehicle.status}</div>

                            <div className="upcoming-image">
                                <div className="coming-soon-overlay">
                                    <span className="launch-date">
                                        Launch: {vehicle.launchDate}
                                    </span>
                                </div>
                                <span className="placeholder-icon">
                                    {vehicleType === 'car' ? '🚗' : '🏍️'}
                                </span>
                            </div>

                            <div className="upcoming-info">
                                <h4>{vehicle.brand} {vehicle.model}</h4>
                                <p className="upcoming-price">
                                    Expected Price: ₹ {(vehicle.price / 100000).toFixed(2)} L
                                </p>
                                <button className="btn-notify">
                                    🔔 Notify Me
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default UpcomingVehicles;
