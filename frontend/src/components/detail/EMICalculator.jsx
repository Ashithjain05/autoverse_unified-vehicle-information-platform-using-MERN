import { useState } from 'react';
import './EMICalculator.css';

function EMICalculator({ vehiclePrice, isAuthenticated, onLoginClick }) {
    const [downPayment, setDownPayment] = useState(vehiclePrice * 0.2);
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenure, setTenure] = useState(36);

    const calculateEMI = () => {
        const principal = vehiclePrice - downPayment;
        const monthlyRate = interestRate / 12 / 100;
        const months = tenure;

        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);

        return isNaN(emi) ? 0 : emi;
    };

    const emi = calculateEMI();
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - (vehiclePrice - downPayment);

    if (!isAuthenticated) {
        return (
            <section className="section emi-section">
                <div className="container">
                    <h2 className="section-title">EMI Calculator</h2>
                    <div className="emi-locked">
                        <div className="lock-icon">🔒</div>
                        <h3>Login to Calculate EMI</h3>
                        <p>Please login to access the EMI calculator and plan your purchase</p>
                        <button onClick={onLoginClick} className="btn btn-primary">
                            Login with OTP
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section emi-section">
            <div className="container">
                <h2 className="section-title">EMI Calculator</h2>

                <div className="emi-calculator card">
                    <div className="emi-inputs">
                        <div className="input-group">
                            <label>Vehicle Price</label>
                            <input
                                type="number"
                                value={vehiclePrice}
                                disabled
                                className="input-disabled"
                            />
                        </div>

                        <div className="input-group">
                            <label>Down Payment: ₹{downPayment.toLocaleString('en-IN')}</label>
                            <input
                                type="range"
                                min={vehiclePrice * 0.1}
                                max={vehiclePrice * 0.5}
                                value={downPayment}
                                onChange={(e) => setDownPayment(Number(e.target.value))}
                                className="slider"
                            />
                        </div>

                        <div className="input-group">
                            <label>Interest Rate (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                min="5"
                                max="20"
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                            />
                        </div>

                        <div className="input-group">
                            <label>Tenure (Months)</label>
                            <select value={tenure} onChange={(e) => setTenure(Number(e.target.value))}>
                                <option value={12}>12 Months</option>
                                <option value={24}>24 Months</option>
                                <option value={36}>36 Months</option>
                                <option value={48}>48 Months</option>
                                <option value={60}>60 Months</option>
                            </select>
                        </div>
                    </div>

                    <div className="emi-result">
                        <div className="emi-card">
                            <span className="emi-label">Monthly EMI</span>
                            <span className="emi-value">₹{Math.round(emi).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="emi-breakdown">
                            <div className="breakdown-item">
                                <span>Principal Amount</span>
                                <span>₹{(vehiclePrice - downPayment).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Total Interest</span>
                                <span>₹{Math.round(totalInterest).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Total Amount Payable</span>
                                <span className="total-amount">₹{Math.round(totalAmount).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default EMICalculator;
