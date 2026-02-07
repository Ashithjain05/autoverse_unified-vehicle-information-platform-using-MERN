import { useVehicle } from '../../context/VehicleContext.jsx';
import { motion } from 'framer-motion';
import './VehicleToggle.css';

function VehicleToggle() {
    const { vehicleType, toggleVehicleType } = useVehicle();

    return (
        <div className="vehicle-toggle-container">
            <div className="vehicle-toggle">
                <button
                    className={`toggle-btn ${vehicleType === 'car' ? 'active' : ''}`}
                    onClick={() => toggleVehicleType('car')}
                >
                    <span className="toggle-icon">🚗</span>
                    <span className="toggle-label">Cars</span>
                </button>

                <button
                    className={`toggle-btn ${vehicleType === 'bike' ? 'active' : ''}`}
                    onClick={() => toggleVehicleType('bike')}
                >
                    <span className="toggle-icon">🏍️</span>
                    <span className="toggle-label">Bikes</span>
                </button>

                <motion.div
                    className="toggle-slider"
                    animate={{
                        x: vehicleType === 'car' ? 0 : '100%'
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            </div>
        </div>
    );
}

export default VehicleToggle;
