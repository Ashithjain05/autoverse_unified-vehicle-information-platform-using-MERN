import './ShowroomContact.css';
import { FaBuilding, FaMapMarkerAlt, FaClock, FaWhatsapp } from 'react-icons/fa';

function ShowroomContact({ showrooms = [], vehicleName = '' }) {
    if (!showrooms || showrooms.length === 0) {
        return null;
    }

    const handleWhatsAppClick = (showroom) => {
        // Use provided phone number logic
        if (showroom.phone) {
            // Clean phone number: remove spaces, +, -, parentheses
            const cleanPhone = showroom.phone.replace(/[^0-9]/g, '');

            // Construct a friendly message with refined context
            const context = vehicleName ? `the ${vehicleName}` : "your vehicles";
            const text = `Hi ${showroom.name}, I found your showroom on AutoVerse. I am interested in checking out ${context}. Can you please share more details?`;

            const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
            window.open(url, '_blank');
        } else if (showroom.whatsappUrl) {
            window.open(showroom.whatsappUrl, '_blank');
        }
    };

    return (
        <div className="showroom-contact-section">
            <h2 className="showroom-title">Available at Showrooms</h2>
            <p className="showroom-subtitle">Contact dealers via WhatsApp for instant assistance</p>

            <div className="showroom-grid">
                {showrooms.slice(0, 3).map((showroom, index) => (
                    <div key={index} className="showroom-card">

                        <div className="showroom-header">
                            <div className="showroom-icon"><FaBuilding /></div>
                            <div className="showroom-info">
                                <h3>{showroom.name}</h3>
                                {showroom.city && (
                                    <p className="showroom-location"><FaMapMarkerAlt /> {showroom.city}</p>
                                )}
                            </div>
                        </div>

                        {showroom.address && (
                            <p className="showroom-address">{showroom.address}</p>
                        )}

                        {showroom.operatingHours && (
                            <p className="showroom-hours">
                                <FaClock /> {showroom.operatingHours}
                            </p>
                        )}

                        {showroom.brands && showroom.brands.length > 0 && (
                            <div className="showroom-brands">
                                <strong>Brands:</strong>{' '}
                                {showroom.brands.join(', ')}
                            </div>
                        )}

                        <button
                            className="whatsapp-btn"
                            onClick={() => handleWhatsAppClick(showroom)}
                        >
                            <span className="whatsapp-icon"><FaWhatsapp /></span>
                            Contact on WhatsApp
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ShowroomContact;
