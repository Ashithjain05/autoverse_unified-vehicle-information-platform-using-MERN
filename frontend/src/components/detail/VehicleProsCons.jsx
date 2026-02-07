import './VehicleProsCons.css';

function VehicleProsCons({ prosCons }) {
    if (!prosCons || (!prosCons.pros?.length && !prosCons.cons?.length)) {
        return null;
    }

    return (
        <div className="pros-cons-section">
            <h2 className="pros-cons-title">Key Insights</h2>
            <p className="pros-cons-subtitle">
                Understanding the strengths and considerations of this vehicle
            </p>

            <div className="pros-cons-grid">
                {/* Advantages */}
                {prosCons.pros && prosCons.pros.length > 0 && (
                    <div className="pros-card">
                        <div className="card-header pros-header">
                            <span className="header-icon">✓</span>
                            <h3>Advantages</h3>
                        </div>
                        <ul className="pros-list">
                            {prosCons.pros.map((pro, index) => (
                                <li key={index} className="pros-item">
                                    <span className="item-icon">✓</span>
                                    <span className="item-text">{pro}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Disadvantages */}
                {prosCons.cons && prosCons.cons.length > 0 && (
                    <div className="cons-card">
                        <div className="card-header cons-header">
                            <span className="header-icon">!</span>
                            <h3>Considerations</h3>
                        </div>
                        <ul className="cons-list">
                            {prosCons.cons.map((con, index) => (
                                <li key={index} className="cons-item">
                                    <span className="item-icon">!</span>
                                    <span className="item-text">{con}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VehicleProsCons;
