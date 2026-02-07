import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import './OTPModal.css';

function OTPModal({ onClose }) {
    const { login } = useAuth();
    const [step, setStep] = useState(1); // 1: phone, 2: OTP, 3: Profile
    const [phone, setPhone] = useState('');
    const [otp, setOTP] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [devOTP, setDevOTP] = useState(''); // For demo
    const [tempAuth, setTempAuth] = useState(null); // Store token/user temporarily

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (!/^[6-9]\d{9}$/.test(phone)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/send-otp', { phone });

            // In development, OTP is sent in response
            if (response.otp) {
                setDevOTP(response.otp);
                alert(`Demo OTP: ${response.otp}`);
            }

            setStep(2);
        } catch (err) {
            setError(err.error || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/auth/verify-otp', { phone, otp });

            if (response.user.isProfileComplete) {
                login(response.token, response.user);
                onClose();
            } else {
                // Profile incomplete, move to step 3
                setTempAuth({ token: response.token, user: response.user });
                setStep(3);
            }
        } catch (err) {
            setError(err.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !email.trim()) {
            setError('Name and Email are required');
            return;
        }

        try {
            setLoading(true);
            // Manually pass token since it's not in localStorage/context yet
            const response = await api.put(
                '/auth/update-profile',
                { name, email },
                {
                    headers: {
                        Authorization: `Bearer ${tempAuth.token}`
                    }
                }
            );

            login(tempAuth.token, response.user);
            onClose();
        } catch (err) {
            setError(err.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (step) {
            case 1: return 'Enter Phone Number';
            case 2: return 'Enter OTP';
            case 3: return 'Complete Profile';
            default: return '';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>

                <h2 className="modal-title">{getTitle()}</h2>

                {error && <div className="error-message">{error}</div>}

                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="otp-form">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="10-digit mobile number"
                                maxLength="10"
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className="otp-form">
                        <p className="otp-sent-msg">OTP sent to {phone}</p>
                        {devOTP && (
                            <div className="dev-otp-display">
                                <strong>Demo OTP:</strong> {devOTP}
                            </div>
                        )}
                        <div className="form-group">
                            <label>Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                                placeholder="6-digit OTP"
                                maxLength="6"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="otp-actions">
                            <button type="button" onClick={() => setStep(1)} className="btn btn-outline">
                                Change Number
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handleUpdateProfile} className="otp-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Complete Registration'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default OTPModal;
