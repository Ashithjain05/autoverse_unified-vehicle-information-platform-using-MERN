import { Routes, Route } from 'react-router-dom';
import { VehicleProvider } from './context/VehicleContext.jsx';
import { CompareProvider } from './context/CompareContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import Chatbot from './components/common/Chatbot.jsx';
import Home from './pages/Home.jsx';
import Listing from './pages/Listing.jsx';
import VehicleDetail from './pages/VehicleDetail.jsx';
import Compare from './pages/Compare.jsx';
import ReviewsAndNews from './pages/ReviewsAndNews.jsx';
import PopularVehiclesPage from './pages/PopularVehiclesPage.jsx';
import NewVehiclesPage from './pages/NewVehiclesPage.jsx';

import { useState, useEffect } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

// Main App Loader to simulate initialization
function MainLoader({ children }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate initial resource loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500); // 1.5s splash screen

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <LoadingSpinner fullscreen />;
    }

    return children;
}

function App() {
    return (
        <VehicleProvider>
            <CompareProvider>
                <div className="app">
                    <MainLoader>
                        <Navbar />
                        <main style={{ minHeight: 'calc(100vh - 72px)' }}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                {/* Unified vehicles route - no separate cars/bikes */}
                                <Route path="/vehicles" element={<Listing />} />
                                <Route path="/new-vehicles" element={<NewVehiclesPage />} />
                                <Route path="/used-vehicles" element={<Listing initialCondition="Used" initialFilterType="all" />} />

                                <Route path="/vehicles/:slug" element={<VehicleDetail />} />
                                <Route path="/popular-vehicles" element={<PopularVehiclesPage />} />
                                <Route path="/compare" element={<Compare />} />
                                <Route path="/reviews-news" element={<ReviewsAndNews />} />
                            </Routes>
                        </main>
                        <Footer />
                        {/* AI Chatbot - Available on all pages */}
                        <Chatbot />
                    </MainLoader>
                </div>
            </CompareProvider>
        </VehicleProvider>
    );
}

export default App;
