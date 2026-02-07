import './LoadingSpinner.css';

function LoadingSpinner({ fullscreen = false, type = 'default' }) {
    if (fullscreen) {
        return (
            <div className="loading-fullscreen">
                <div className="spinner-container">
                    <div className="spinner-brand-pulse">
                        <span className="brand-text-sm">AUTO</span>
                        <span className="brand-text-accent">VERSE</span>
                    </div>
                    <div className="spinner-bar">
                        <div className="spinner-bar-fill"></div>
                    </div>
                </div>
            </div>
        );
    }

    return <div className="spinner"></div>;
}

export default LoadingSpinner;
