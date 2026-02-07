import { useNavigate } from 'react-router-dom';
import { useVehicle } from '../../context/VehicleContext.jsx';
import './HeroSection.css';

function HeroSection() {
    const navigate = useNavigate();
    const { vehicleType } = useVehicle();

    const handleSearch = (e) => {
        e.preventDefault();
        const searchTerm = e.target.search.value;
        navigate(`/${vehicleType}s?search=${encodeURIComponent(searchTerm)}`);
    };

    return (
        <section className="hero-section">
            <div className="hero-overlay"></div>
            <div className="hero-content">
                <h1 className="hero-title">
                    Find Your Dream {vehicleType === 'car' ? 'Car' : 'Bike'}
                </h1>
                <p className="hero-subtitle">
                    Explore thousands of vehicles with the best prices and deals
                </p>

                <form className="hero-search" onSubmit={handleSearch}>
                    <input
                        type="text"
                        name="search"
                        placeholder={`Search for ${vehicleType === 'car' ? 'cars' : 'bikes'} by brand, model...`}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">
                        <span className="search-icon">🔍</span>
                        Search
                    </button>
                </form>

                <div className="hero-stats">
                    <div className="stat">
                        <div className="stat-number">500+</div>
                        <div className="stat-label">Vehicles</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">100+</div>
                        <div className="stat-label">Brands</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">50+</div>
                        <div className="stat-label">Cities</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">10K+</div>
                        <div className="stat-label">Happy Customers</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
