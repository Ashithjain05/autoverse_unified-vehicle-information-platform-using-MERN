import { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export function CompareProvider({ children }) {
    const [compareList, setCompareList] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('autoverse_compare');
        if (saved) {
            try {
                setCompareList(JSON.parse(saved));
            } catch (error) {
                console.error('Error loading compare list:', error);
            }
        }
    }, []);

    // Save to localStorage whenever compareList changes
    useEffect(() => {
        localStorage.setItem('autoverse_compare', JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (vehicleSlug) => {
        if (compareList.length >= 3) {
            console.warn('Comparison limit reached (3 vehicles)');
            return false;
        }

        if (compareList.includes(vehicleSlug)) {
            return false;
        }

        setCompareList([...compareList, vehicleSlug]);
        return true;
    };

    const removeFromCompare = (vehicleSlug) => {
        setCompareList(compareList.filter(slug => slug !== vehicleSlug));
    };

    const clearCompare = () => {
        if (window.confirm('Are you sure you want to clear all vehicles from comparison?')) {
            setCompareList([]);
        }
    };

    const isInCompare = (vehicleSlug) => {
        return compareList.includes(vehicleSlug);
    };

    const value = {
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        compareCount: compareList.length,
    };

    return (
        <CompareContext.Provider value={value}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within CompareProvider');
    }
    return context;
}
