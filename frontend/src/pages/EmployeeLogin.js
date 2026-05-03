import React, { useState } from 'react';
import { employeeLogin } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import {
    getApiErrorMessage,
    hasErrors,
    sanitizers,
    validateEmployeeLogin
} from '../utils/validation';
import './Auth.css';

const EmployeeLogin = () => {
    const [employeeNumber, setEmployeeNumber] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleEmployeeNumberChange = (value) => {
        setEmployeeNumber(sanitizers.employeeNumber(value));
        setErrors(prev => ({ ...prev, employeeNumber: '' }));
        setError('');
    };

    const handlePasswordChange = (value) => {
        setPassword(value);
        setErrors(prev => ({ ...prev, password: '' }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateEmployeeLogin({ employeeNumber, password });
        setErrors(validationErrors);

        if (hasErrors(validationErrors)) {
            setError('Please correct the highlighted fields.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await employeeLogin(employeeNumber, password);
            navigate('/employee-dashboard');
        } catch (err) {
            setError(getApiErrorMessage(err, 'Invalid credentials.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Employee Login</h2>
                {error && <div className="auth-error" role="alert">{error}</div>}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="employeeNumber">Employee Number</label>
                        <input
                            id="employeeNumber"
                            type="text"
                            placeholder="EMP001"
                            value={employeeNumber}
                            onChange={e => handleEmployeeNumberChange(e.target.value)}
                            required
                        />
                        {errors.employeeNumber && <span className="field-error">{errors.employeeNumber}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="employeePassword">Password</label>
                        <input
                            id="employeePassword"
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
            </div>
        </div>
    );
};

export default EmployeeLogin;
