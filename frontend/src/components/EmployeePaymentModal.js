import React, { useState } from 'react';
import { sanitizers } from '../utils/validation';

const EmployeePaymentModal = ({ payment, onClose, onAction }) => {
    const [rejectReason, setRejectReason] = useState('');
    const [uetr, setUetr] = useState('');
    const [showUetr, setShowUetr] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVerify = async () => {
        setIsSubmitting(true);
        const result = await onAction(payment.id, 'verify');
        setIsSubmitting(false);
        if (result?.error) return setError(result.error);
        onClose();
    };

    const handleReject = async () => {
        if (rejectReason.trim().length < 5) {
            setError('Please enter a rejection reason of at least 5 characters.');
            return;
        }

        setIsSubmitting(true);
        const result = await onAction(payment.id, 'reject', rejectReason.trim());
        setIsSubmitting(false);
        if (result?.error) return setError(result.error);
        onClose();
    };

    const handleSubmitToSwift = async () => {
        setIsSubmitting(true);
        const result = await onAction(payment.id, 'submit');
        setIsSubmitting(false);

        if (result && result.uetr) {
            setUetr(result.uetr);
            setShowUetr(true);
        } else if (result?.error) {
            setError(result.error);
        } else {
            onClose();
        }
    };

    const handleRejectReasonChange = (value) => {
        setRejectReason(sanitizers.search(value));
        setError('');
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: 20, borderRadius: 8, maxWidth: 500, width: '90%', maxHeight: '80%', overflow: 'auto' }}>
                <h3>Payment Verification</h3>
                {error && <div className="form-error" role="alert">{error}</div>}
                <p><strong>Payment ID:</strong> {payment.id}</p>
                <p><strong>Customer:</strong> {payment.customerName || payment.customerId}</p>
                <p><strong>Amount:</strong> {payment.amount} {payment.currency}</p>
                <p><strong>SWIFT Code:</strong> {payment.swift_code}</p>
                <p><strong>Beneficiary:</strong> {payment.payee_name} ({payment.payee_account})</p>
                <p><strong>Status:</strong> {payment.status}</p>
                {payment.status === 'pending' && (
                    <div>
                        <button onClick={handleVerify} disabled={isSubmitting}>
                            {isSubmitting ? 'Processing...' : 'Verify & Approve'}
                        </button>
                        <div style={{ marginTop: 10 }}>
                            <textarea placeholder="Rejection reason (required)" value={rejectReason} onChange={e => handleRejectReasonChange(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
                            <button onClick={handleReject} disabled={isSubmitting}>Reject</button>
                        </div>
                    </div>
                )}
                {payment.status === 'verified' && (
                    <button onClick={handleSubmitToSwift} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit to SWIFT'}
                    </button>
                )}
                {showUetr && uetr && (
                    <div style={{ marginTop: 10, padding: 8, background: '#e0f7fa', borderRadius: 4 }}>
                        <strong>UETR (Unique End-to-End Reference):</strong> {uetr}
                        <button onClick={() => navigator.clipboard.writeText(uetr)} style={{ marginLeft: 10 }}>Copy</button>
                    </div>
                )}
                <button onClick={onClose} style={{ marginTop: 10 }}>Close</button>
            </div>
        </div>
    );
};

export default EmployeePaymentModal;
