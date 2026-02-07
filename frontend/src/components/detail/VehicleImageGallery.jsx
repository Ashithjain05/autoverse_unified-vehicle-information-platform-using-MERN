import { useState, useEffect } from 'react';
import './VehicleImageGallery.css';

function VehicleImageGallery({ vehicle }) {
    const [activeTab, setActiveTab] = useState('exterior');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    // Initialize selected color
    useEffect(() => {
        if (vehicle?.images?.colors?.length > 0 && !selectedColor) {
            setSelectedColor(vehicle.images.colors[0]);
        }
    }, [vehicle, selectedColor]);

    // Reset image index when tab changes
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [activeTab]);

    if (!vehicle || !vehicle.images) {
        return <div className="gallery-loading">Loading gallery...</div>;
    }

    const { images } = vehicle;

    // Get current images based on active tab and selected color
    const getCurrentImages = () => {
        switch (activeTab) {
            case 'exterior':
                // If a color is selected and has specific image, use it; otherwise use default exterior
                if (selectedColor?.image) {
                    return [selectedColor.image];
                }
                return images.exterior || [];
            case 'interior':
                return images.interior || [];
            case 'colors':
                return images.exterior || []; // Show exterior images in color tab too
            case '360':
                return []; // 360 view is interactive, not a static image
            default:
                return [];
        }
    };

    const currentImages = getCurrentImages();

    // Navigation handlers
    const goToNextImage = () => {
        if (currentImageIndex < currentImages.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const goToPrevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    // Color selection handler
    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setCurrentImageIndex(0);
    };

    // 360° view handlers
    const handle360MouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.clientX);
    };

    const handle360MouseMove = (e) => {
        if (isDragging) {
            const deltaX = e.clientX - startX;
            setRotation(prev => prev + deltaX * 0.5);
            setStartX(e.clientX);
        }
    };

    const handle360MouseUp = () => {
        setIsDragging(false);
    };

    // Get tabs based on vehicle type
    const getTabs = () => {
        const baseTabs = [
            { id: 'exterior', label: 'Exterior View', icon: vehicle.type === 'car' ? '🚗' : '🏍️' }
        ];

        // Only show interior for cars
        if (vehicle.type === 'car') {
            baseTabs.push({ id: 'interior', label: 'Interior View', icon: '🪑' });
        }

        // Add colors and 360° for all
        baseTabs.push(
            { id: 'colors', label: 'Available Colors', icon: '🎨' },
            { id: '360', label: '360° View', icon: '🔄' }
        );

        return baseTabs;
    };

    const tabs = getTabs();

    return (
        <div className="vehicle-image-gallery">
            {/* Tab Navigation */}
            <div className="gallery-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`gallery-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="gallery-content">
                {/* Image Slider for Exterior/Interior */}
                {(activeTab === 'exterior' || activeTab === 'interior') && (
                    <div className="image-slider-container">
                        {currentImages.length > 0 ? (
                            <>
                                <div className="image-slider">
                                    <img
                                        src={currentImages[currentImageIndex]}
                                        alt={`${vehicle.brand} ${vehicle.model} ${activeTab}`}
                                        className="slider-image"
                                    />
                                </div>

                                {/* Navigation Arrows */}
                                {currentImages.length > 1 && (
                                    <>
                                        <button
                                            className="slider-arrow slider-arrow-left"
                                            onClick={goToPrevImage}
                                            disabled={currentImageIndex === 0}
                                        >
                                            ‹
                                        </button>
                                        <button
                                            className="slider-arrow slider-arrow-right"
                                            onClick={goToNextImage}
                                            disabled={currentImageIndex === currentImages.length - 1}
                                        >
                                            ›
                                        </button>
                                    </>
                                )}

                                {/* Image Counter */}
                                {currentImages.length > 1 && (
                                    <div className="image-counter">
                                        {currentImageIndex + 1} / {currentImages.length}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-images-placeholder">
                                <span className="placeholder-icon">
                                    {vehicle.type === 'car' ? '🚗' : '🏍️'}
                                </span>
                                <p>No {activeTab} images available</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Color Selection View */}
                {activeTab === 'colors' && (
                    <div className="colors-view">
                        <div className="color-preview">
                            {currentImages.length > 0 ? (
                                <img
                                    src={currentImages[currentImageIndex]}
                                    alt={`${vehicle.brand} ${vehicle.model} - ${selectedColor?.name || 'Default'}`}
                                    className="color-preview-image"
                                    style={selectedColor?.hex ? { filter: `hue-rotate(${getHueRotation(selectedColor.hex)}deg)` } : {}}
                                />
                            ) : (
                                <div className="no-images-placeholder">
                                    <span className="placeholder-icon">
                                        {vehicle.type === 'car' ? '🚗' : '🏍️'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="color-selection">
                            <h3 className="color-section-title">Select Color</h3>
                            <div className="color-buttons">
                                {images.colors?.map((color, index) => (
                                    <button
                                        key={index}
                                        className={`color-button ${selectedColor === color ? 'selected' : ''}`}
                                        onClick={() => handleColorSelect(color)}
                                        title={color.name}
                                    >
                                        <div
                                            className="color-swatch"
                                            style={{ backgroundColor: color.hex }}
                                        />
                                        <span className="color-name">{color.name}</span>
                                        {selectedColor === color && (
                                            <span className="color-check">✓</span>
                                        )}
                                    </button>
                                )) || <p>No color options available</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 360° Interactive View */}
                {activeTab === '360' && (
                    <div
                        className="view-360-container"
                        onMouseDown={handle360MouseDown}
                        onMouseMove={handle360MouseMove}
                        onMouseUp={handle360MouseUp}
                        onMouseLeave={handle360MouseUp}
                    >
                        <div className="view-360-content" style={{ transform: `rotateY(${rotation}deg)` }}>
                            {currentImages[0] || images.exterior?.[0] ? (
                                <img
                                    src={currentImages[0] || images.exterior[0]}
                                    alt={`${vehicle.brand} ${vehicle.model} 360° View`}
                                    className="view-360-image"
                                    draggable="false"
                                />
                            ) : (
                                <div className="view-360-placeholder">
                                    <span className="placeholder-icon-3d">🔄</span>
                                    <p>360° View</p>
                                </div>
                            )}
                        </div>
                        <div className="view-360-instructions">
                            <span className="instruction-icon">👆</span>
                            Drag to rotate
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper function to approximate color hue rotation (basic color simulation)
function getHueRotation(hexColor) {
    // Simple color mapping for demo purposes
    const colorMap = {
        '#1a1a1a': 0,      // Black - no rotation
        '#f0f0f0': 0,      // White - no rotation
        '#d32f2f': 0,      // Red - base
        '#9e9e9e': 0,      // Silver - no rotation
        '#1565c0': 130     // Blue - blue shift
    };
    return colorMap[hexColor.toLowerCase()] || 0;
}

export default VehicleImageGallery;
