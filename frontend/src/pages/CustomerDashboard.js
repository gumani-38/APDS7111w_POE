import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import CurrencySwitcher from '../components/CurrencySwitcher';
import TransactionTimeline from '../components/TransactionTimeline';
import CreatePaymentModal from '../components/CreatePaymentModal';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../utils/validation';
import './Dashboard.css';

const CustomerDashboard = () => {
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchPayments = useCallback(async () => {
        try {
            setError('');
            const res = await api.get('/payments');
            setPayments(res.data);
        } catch (err) {
            if (err.response?.status === 401) navigate('/customer-login');
            else setError(getApiErrorMessage(err, 'Could not load payment history.'));
        }
    }, [navigate]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'settled': return '#4caf50';
            case 'rejected': return '#f44336';
            case 'verified': return '#2196f3';
            default: return '#ff9800';
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            navigate('/customer-login');
        } catch (err) {
            setError(getApiErrorMessage(err, 'Logout failed. Please try again.'));
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Customer Dashboard</h2>

            <CurrencySwitcher />
            {error && <div className="form-error" role="alert">{error}</div>}

            <div className="new-payment-section">
                <button onClick={() => setShowPaymentModal(true)} className="new-payment-btn">
                    + New Payment
                </button>
            </div>

            <h3>Payment History</h3>
            {payments.length === 0 ? (
                <p>No payments yet.</p>
            ) : (
                <table className="payments-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Beneficiary</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(p => (
                            <tr key={p.id}>
                                <td data-label="Date">{new Date(p.created_at).toLocaleDateString()}</td>
                                <td data-label="Amount">{p.amount} {p.currency}</td>
                                <td data-label="Beneficiary">{p.payee_name}</td>
                                <td data-label="Status">
                                    <span className="status-badge" style={{ backgroundColor: getStatusColor(p.status) }}>
                                        {p.status}
                                    </span>
                                </td>
                                <td data-label="Action">
                                    <button onClick={() => setSelectedPayment(p)} className="details-btn">Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Logout button is now below Payment History */}
            <button onClick={handleLogout} className="logout-btn" style={{ marginTop: '20px' }}>
                Logout
            </button>

            {/* Modals */}
            {selectedPayment && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setSelectedPayment(null)}>×</button>
                        <h3>Payment Details</h3>
                        <p><strong>Amount:</strong> {selectedPayment.amount} {selectedPayment.currency}</p>
                        <p><strong>Beneficiary:</strong> {selectedPayment.payee_name}</p>
                        <p><strong>Beneficiary Account:</strong> {selectedPayment.payee_account}</p>
                        <p><strong>SWIFT Code:</strong> {selectedPayment.swift_code}</p>
                        <p><strong>Status:</strong> {selectedPayment.status}</p>
                        <TransactionTimeline currentStatus={selectedPayment.status} />
                        <button onClick={() => setSelectedPayment(null)}>Close</button>
                    </div>
                </div>
            )}

            {showPaymentModal && (
                <CreatePaymentModal
                    onClose={() => setShowPaymentModal(false)}
                    onPaymentCreated={() => {
                        fetchPayments();
                        setShowPaymentModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default CustomerDashboard;
