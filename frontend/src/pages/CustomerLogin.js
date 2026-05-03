import React, { useState } from 'react';
import { login, verifyOtp } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import {
    getApiErrorMessage,
    hasErrors,
    sanitizers,
    validateCustomerLogin,
    validateOtp
} from '../utils/validation';
import './Auth.css';

const CustomerLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState('password');
    const [otp, setOtp] = useState('');
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleUsernameChange = (value) => {
        setUsername(sanitizers.username(value));
        setErrors(prev => ({ ...prev, username: '' }));
        setError('');
    };

    const handlePasswordChange = (value) => {
        setPassword(value);
        setErrors(prev => ({ ...prev, password: '' }));
        setError('');
    };

    const handleOtpChange = (value) => {
        setOtp(sanitizers.digits(value, 6));
        setErrors(prev => ({ ...prev, otp: '' }));
        setError('');
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateCustomerLogin({ username, password });
        setErrors(validationErrors);

        if (hasErrors(validationErrors)) {
            setError('Please correct the highlighted fields.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await login(username, password);
            setStep('otp');
            setError('');
        } catch (err) {
            setError(getApiErrorMessage(err, 'Invalid credentials.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateOtp(otp);
        setErrors(validationErrors);

        if (hasErrors(validationErrors)) {
            setError('Please correct the highlighted fields.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await verifyOtp(username, otp);
            navigate('/customer-dashboard');
        } catch (err) {
            setError(getApiErrorMessage(err, 'Invalid OTP.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Customer Login</h2>
                {error && <div className="auth-error" role="alert">{error}</div>}
                {step === 'password' ? (
                    <form onSubmit={handlePasswordSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={e => handleUsernameChange(e.target.value)}
                                required
                                autoFocus
                            />
                            {errors.username && <span className="field-error">{errors.username}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => handlePasswordChange(e.target.value)}
                                required
                            />
                            {errors.password && <span className="field-error">{errors.password}</span>}
                        </div>
                        <button type="submit" className="auth-button" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="otp">OTP Code</label>
                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={e => handleOtpChange(e.target.value)}
                                required
                                autoFocus
                            />
                            {errors.otp && <span className="field-error">{errors.otp}</span>}
                        </div>
                        <button type="submit" className="auth-button" disabled={isSubmitting}>
                            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}
                <p className="auth-link">
                    <a href="/customer-register">Don't have an account? Register</a>
                </p>
            </div>
        </div>
    );
};

export default CustomerLogin;
