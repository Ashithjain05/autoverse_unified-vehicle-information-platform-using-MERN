import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import './ProfileDropdown.css';

function ProfileDropdown() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="profile-dropdown" ref={dropdownRef}>
            <button
                className="profile-button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="User profile"
            >
                <span className="profile-icon">👤</span>
            </button>

            {isOpen && (
                <div className="profile-menu">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {user?.name?.charAt(0).toUpperCase() || '👤'}
                        </div>
                        <div className="profile-info">
                            <h4 className="profile-name">{user?.name || 'User'}</h4>
                            <p className="profile-email">{user?.email || 'No email provided'}</p>
                        </div>
                    </div>

                    <div className="profile-details">
                        <div className="profile-detail-item">
                            <span className="detail-label">📱 Phone:</span>
                            <span className="detail-value">{user?.phone || 'Not provided'}</span>
                        </div>
                        <div className="profile-detail-item">
                            <span className="detail-label">✉️ Email:</span>
                            <span className="detail-value">{user?.email || 'Not provided'}</span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button onClick={logout} className="btn-logout">
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileDropdown;
