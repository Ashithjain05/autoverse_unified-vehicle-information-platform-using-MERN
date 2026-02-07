import { useVehicle } from '../../context/VehicleContext.jsx';
import './ReviewsSection.css';
import { useNavigate } from 'react-router-dom';

function ReviewsSection() {
    const { vehicleType } = useVehicle();
    const navigate = useNavigate();

    const carReviews = [
        {
            id: 1,
            name: 'Rajesh Kumar',
            vehicle: 'Hyundai Creta',
            rating: 5,
            comment: 'Amazing car! Perfect for family trips. The mileage is great and the features are top-notch.',
            date: '2 days ago',
            verified: true,
        },
        {
            id: 2,
            name: 'Priya Singh',
            vehicle: 'Maruti Swift',
            rating: 4,
            comment: 'Great value for money. Smooth driving experience and excellent fuel efficiency.',
            date: '5 days ago',
            verified: true,
        },
        {
            id: 3,
            name: 'Amit Sharma',
            vehicle: 'Tata Nexon',
            rating: 5,
            comment: 'Best in segment! The build quality is exceptional and the electric variant is a game changer.',
            date: '1 week ago',
            verified: true,
        },
    ];

    const bikeReviews = [
        {
            id: 4,
            name: 'Vikram Patel',
            vehicle: 'Royal Enfield Classic 350',
            rating: 5,
            comment: 'Dream bike! The thump sound is music to my ears. Perfect for long rides.',
            date: '3 days ago',
            verified: true,
        },
        {
            id: 5,
            name: 'Neha Reddy',
            vehicle: 'Yamaha R15 V4',
            rating: 4,
            comment: 'Sporty and stylish. Great for daily commute and weekend rides. Highly recommended!',
            date: '1 week ago',
            verified: true,
        },
        {
            id: 6,
            name: 'Arjun Mehta',
            vehicle: 'KTM Duke 390',
            rating: 5,
            comment: 'Beast on the road! The power and handling are unmatched. Worth every penny.',
            date: '2 weeks ago',
            verified: true,
        },
    ];

    const reviews = vehicleType === 'car' ? carReviews : bikeReviews;

    return (
        <section className="reviews-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">
                        ⭐ Customer Reviews
                    </h2>
                    <p className="section-subtitle">
                        What our customers are saying about their {vehicleType === 'car' ? 'cars' : 'bikes'}
                    </p>
                </div>

                <div className="reviews-grid">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <div className="reviewer-avatar">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="reviewer-name">
                                            {review.name}
                                            {review.verified && (
                                                <span className="verified-badge" title="Verified Purchase">
                                                    ✓
                                                </span>
                                            )}
                                        </h4>
                                        <p className="review-vehicle">{review.vehicle}</p>
                                    </div>
                                </div>
                                <span className="review-date">{review.date}</span>
                            </div>

                            <div className="review-rating">
                                {[...Array(5)].map((_, index) => (
                                    <span
                                        key={index}
                                        className={`star ${index < review.rating ? 'filled' : ''}`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>

                            <p className="review-comment">{review.comment}</p>

                            <div className="review-actions">
                                <button className="helpful-btn">👍 Helpful</button>
                                <button className="helpful-btn">👎</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="section-actions">
                    <button className="btn-view-all-reviews">
                        View All Reviews
                    </button>
                </div>
            </div>
        </section>
    );
}

export default ReviewsSection;
