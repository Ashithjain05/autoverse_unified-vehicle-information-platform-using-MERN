import './Placeholder.css';

function Placeholder({ title }) {
    return (
        <div className="placeholder-page">
            <div className="container">
                <div className="placeholder-content">
                    <h1>{title}</h1>
                    <p>This feature is coming soon!</p>
                    <div className="placeholder-icon">🚧</div>
                </div>
            </div>
        </div>
    );
}

export default Placeholder;
