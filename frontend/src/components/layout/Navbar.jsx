import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useVehicle } from '../../context/VehicleContext.jsx';
import { useState, useEffect } from 'react';
import ProfileDropdown from './ProfileDropdown.jsx';
import OTPModal from '../auth/OTPModal.jsx';
import './Navbar.css';

function Navbar() {
    const location = useLocation();
    const { isAuthenticated, user, logout } = useAuth();
    const { vehicleType } = useVehicle();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100); // Show after scrolling past hero
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const searchTerm = e.target.search.value;
        if (searchTerm.trim()) {
            navigate(`/${vehicleType}s?search=${encodeURIComponent(searchTerm)}`);
        }
    };


    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-brand">
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                    <Link to="/" className="navbar-logo">
                        <span className="logo-text">AUTO</span>
                        <span className="logo-accent">VERSE</span>
                    </Link>
                </div>

                <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                    <Link
                        to="/"
                        className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/vehicles"
                        className={`navbar-link ${isActive('/vehicles') ? 'active' : ''}`}
                    >
                        Vehicles
                    </Link>
                    <Link
                        to="/new-vehicles"
                        className={`navbar-link ${isActive('/new-vehicles') ? 'active' : ''}`}
                    >
                        New Vehicles
                    </Link>
                    <Link
                        to="/used-vehicles"
                        className={`navbar-link ${isActive('/used-vehicles') ? 'active' : ''}`}
                    >
                        Used Vehicles
                    </Link>
                    <Link
                        to="/reviews-news"
                        className={`navbar-link ${isActive('/reviews-news') ? 'active' : ''}`}
                    >
                        Reviews & News
                    </Link>
                    <Link
                        to="/compare"
                        className={`navbar-link ${isActive('/compare') ? 'active' : ''}`}
                    >
                        Compare
                    </Link>
                </div>

                <div className="navbar-right-section">
                    {/* Sticky Search Bar (Desktop Only) */}
                    <div className={`navbar-search-container ${scrolled ? 'visible' : ''}`}>
                        <form onSubmit={handleSearch} className="navbar-search-form">
                            <input
                                type="text"
                                name="search"
                                placeholder="Search..."
                                className="navbar-search-input"
                            />
                            <button type="submit" className="navbar-search-btn">🔍</button>
                        </form>
                    </div>

                    <div className="navbar-actions">
                        {isAuthenticated() ? (
                            <ProfileDropdown />
                        ) : (
                            <button
                                className="profile-button"
                                onClick={() => setShowAuthModal(true)}
                                aria-label="Login"
                            >
                                <span className="user-icon">👤</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {showAuthModal && <OTPModal onClose={() => setShowAuthModal(false)} />}
        </nav>
    );
}

export default Navbar;
