import './Footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-section">
                        <h4 className="footer-logo">
                            <span className="logo-text">AUTO</span>
                            <span className="logo-accent">VERSE</span>
                        </h4>
                        <p className="footer-desc">
                            Your premium automotive discovery platform for finding the perfect car or bike.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h5 className="footer-heading">Quick Links</h5>
                        <ul className="footer-links">
                            <li><a href="/cars">New Cars</a></li>
                            <li><a href="/bikes">New Bikes</a></li>
                            <li><a href="/compare">Compare</a></li>
                            <li><a href="/reviews">Reviews</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h5 className="footer-heading">Company</h5>
                        <ul className="footer-links">
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Contact</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h5 className="footer-heading">Connect</h5>
                        <div className="footer-social">
                            <a href="#" className="social-link">📘</a>
                            <a href="#" className="social-link">📸</a>
                            <a href="#" className="social-link">🐦</a>
                            <a href="#" className="social-link">📺</a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Autoverse. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
