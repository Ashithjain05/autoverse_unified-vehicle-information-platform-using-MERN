import HeroSection from '../components/home/HeroSection.jsx';
import PopularVehicles from '../components/home/PopularVehicles.jsx';
import TrendingSection from '../components/home/TrendingSection.jsx';
import BrandGrid from '../components/home/BrandGrid.jsx';
import UpcomingVehicles from '../components/home/UpcomingVehicles.jsx';
import ReviewsSection from '../components/home/ReviewsSection.jsx';
import RecentlyViewed from '../components/home/RecentlyViewed.jsx';
import './Home.css';

function Home() {
    return (
        <div className="home">
            {/* Hero Section with Search */}
            <HeroSection />

            {/* Popular Vehicles Section */}
            <PopularVehicles />

            {/* Trending Vehicles Carousel */}
            <TrendingSection />

            {/* All Brands Grid */}
            <BrandGrid />

            {/* Upcoming Vehicles */}
            <UpcomingVehicles />

            {/* Recently Viewed */}
            <RecentlyViewed />

            {/* Customer Reviews */}
            <ReviewsSection />
        </div>
    );
}

export default Home;
