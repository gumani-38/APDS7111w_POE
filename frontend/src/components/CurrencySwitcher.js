import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CurrencySwitcher = ({ onCurrencyChange }) => {
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [convertedBalance, setConvertedBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchConvertedBalance = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get('/user/balance', { params: { currency: selectedCurrency } });
                setConvertedBalance(response.data.convertedBalance);
                if (onCurrencyChange) onCurrencyChange(selectedCurrency);
            } catch (err) {
                console.error(err);
                setError('Could not convert balance');
            } finally {
                setLoading(false);
            }
        };
        fetchConvertedBalance();
    }, [selectedCurrency, onCurrencyChange]);

    return (
        <div style={{ marginBottom: 20, padding: 10, background: '#f5f5f5', borderRadius: 8 }}>
            <label htmlFor="currency-select" style={{ marginRight: 10 }}>Show balance in: </label>
            <select id="currency-select" value={selectedCurrency} onChange={e => setSelectedCurrency(e.target.value)}>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="ZAR">ZAR - South African Rand</option>
            </select>
            <div style={{ marginTop: 10, fontWeight: 'bold' }}>
                {loading ? 'Loading...' : error ? <span style={{ color: 'red' }}>{error}</span> : convertedBalance !== null ? `${selectedCurrency} ${convertedBalance.toFixed(2)}` : 'Unable to load balance'}
            </div>
        </div>
    );
};

export default CurrencySwitcher;