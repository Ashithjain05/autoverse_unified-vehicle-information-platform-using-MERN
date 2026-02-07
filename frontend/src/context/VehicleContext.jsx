import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const VehicleContext = createContext();

export function VehicleProvider({ children }) {
    const [vehicleType, setVehicleType] = useState('car');
    const navigate = useNavigate();
    const location = useLocation();

    // Sync vehicle type with current route
    useEffect(() => {
        const path = location.pathname;
        if (path.startsWith('/bikes') || path.includes('/bikes/')) {
            setVehicleType('bike');
        } else if (path.startsWith('/cars') || path.includes('/cars/')) {
            setVehicleType('car');
        }
    }, [location]);

    const toggleVehicleType = (newType) => {
        if (newType === vehicleType) return;

        setVehicleType(newType);

        // Navigate to appropriate page
        const currentPath = location.pathname;

        if (currentPath === '/' || currentPath === '/cars' || currentPath === '/bikes') {
            navigate(newType === 'car' ? '/cars' : '/bikes');
        } else if (currentPath.includes('/cars/') || currentPath.includes('/bikes/')) {
            // On detail page, go to listing
            navigate(newType === 'car' ? '/cars' : '/bikes');
        } else {
            // On other pages, just update state
            // User can manually navigate
        }
    };

    const value = {
        vehicleType,
        setVehicleType,
        toggleVehicleType,
        isCar: vehicleType === 'car',
        isBike: vehicleType === 'bike'
    };

    return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
}

export function useVehicle() {
    const context = useContext(VehicleContext);
    if (!context) {
        throw new Error('useVehicle must be used within VehicleProvider');
    }
    return context;
}
