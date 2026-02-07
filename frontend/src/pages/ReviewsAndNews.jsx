import { useState, useEffect } from 'react';
import api from '../services/api.js';
import './ReviewsAndNews.css';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

function ReviewsAndNews() {
    const [activeTab, setActiveTab] = useState('reviews');
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [news, setNews] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch all vehicles to generate dynamic content
            const response = await api.get('/vehicles?limit=50'); // Get enough vehicles
            const vehicles = response.data;

            generateDynamicContent(vehicles);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateDynamicContent = (vehicles) => {
        // Generate Reviews from Vehicles
        const generatedReviews = vehicles.map((vehicle, index) => {
            // Select pros as comment if available, else generic
            const comment = vehicle.pros_cons?.pros?.[0]
                ? `${vehicle.pros_cons.pros[0]}! ${vehicle.pros_cons.pros[1] || 'Ideally designed.'}`
                : `The ${vehicle.brand} ${vehicle.model} is an absolute beast. Loving the performance and the comfort.`;

            // Randomize user names and dates for variety
            const names = ["Rajesh Kumar", "Priya Singh", "Amit Sharma", "Vikram Patel", "Neha Reddy", "Arjun Mehta", "Suresh Raina", "Anjali Gupta"];
            const dates = ["2 Days ago", "5 days ago", "1 Week ago", "2 Weeks ago", "Yesterday", "Just now"];

            return {
                id: `rev-${vehicle.id || index}`,
                title: `${vehicle.brand} ${vehicle.model} Review`,
                excerpt: comment,
                author: names[index % names.length],
                date: dates[index % dates.length],
                image: vehicle.images?.exterior?.[0] || 'https://via.placeholder.com/800x600?text=Vehicle+Review',
                category: "Owner Review",
                rating: vehicle.rating || 4.5,
                vehicleName: `${vehicle.brand} ${vehicle.model}`
            };
        }).slice(0, 15); // Show top 15 reviews

        // Generate News from Vehicles
        const generatedNews = vehicles.slice(0, 10).map((vehicle, index) => {
            const newsTitles = [
                `Refreshed ${vehicle.brand} ${vehicle.model} Spotted Testing`,
                `${vehicle.brand} Announces New Features for ${vehicle.model}`,
                `Sales Report: ${vehicle.model} Tops the Charts this Month`,
                `Long Term Review: 10,000km with the ${vehicle.brand} ${vehicle.model}`
            ];

            return {
                id: `news-${vehicle.id || index}`,
                title: newsTitles[index % newsTitles.length],
                excerpt: `Latest updates on the ${vehicle.brand} ${vehicle.model}. Read to know more about pricing, features and availability.`,
                date: index === 0 ? "Today, 10:30 AM" : `${index + 1} Days ago`,
                image: vehicle.images?.exterior?.[1] || vehicle.images?.exterior?.[0] || 'https://via.placeholder.com/800x600?text=Auto+News',
                source: "AutoVerse News"
            };
        });

        setReviews(generatedReviews);
        setNews(generatedNews);
    };

    if (loading) return <LoadingSpinner fullscreen />;

    return (
        <div className="reviews-news-page">
            <div className="container">
                <div className="page-header">
                    <h1>Reviews & News</h1>
                    <p>Stay updated with real-time feedback and latest automotive news</p>
                </div>

                <div className="tab-controls">
                    <button
                        className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Customer Reviews
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
                        onClick={() => setActiveTab('news')}
                    >
                        Latest News
                    </button>
                </div>

                <div className="content-grid">
                    {activeTab === 'reviews' ? (
                        reviews.map(item => (
                            <div key={item.id} className="article-card">
                                <div className="article-image">
                                    <img src={item.image} alt={item.title} />
                                    <span className="category-tag">⭐ {item.rating}/5</span>
                                </div>
                                <div className="article-content">
                                    <div className="news-source">{item.vehicleName}</div>
                                    <h3>{item.title}</h3>
                                    <p>"{item.excerpt}"</p>
                                    <div className="article-meta">
                                        <span>✍️ {item.author}</span>
                                        <span>🕒 {item.date}</span>
                                    </div>
                                    <button className="read-more">Read Full Review</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        news.map(item => (
                            <div key={item.id} className="article-card news-card">
                                <div className="article-image">
                                    <img src={item.image} alt={item.title} />
                                </div>
                                <div className="article-content">
                                    <div className="news-source">{item.source}</div>
                                    <h3>{item.title}</h3>
                                    <p>{item.excerpt}</p>
                                    <div className="article-meta">
                                        <span>📅 {item.date}</span>
                                    </div>
                                    <button className="read-more">Read Full Story</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReviewsAndNews;
