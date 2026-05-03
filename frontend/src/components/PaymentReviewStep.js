import React from 'react';

const PaymentReviewStep = ({ payment, fees, total, onConfirm, onBack }) => {
    return (
        <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}>
            <h3>Review Your Payment</h3>
            <table style={{ width: '100%', marginTop: 16, marginBottom: 20, borderCollapse: 'collapse' }}>
                <tbody>
                    <tr><td><strong>Amount:</strong></td><td>{payment.amount} {payment.currency}</td></tr>
                    <tr><td><strong>Provider:</strong></td><td>{payment.provider}</td></tr>
                    <tr><td><strong>SWIFT Code:</strong></td><td>{payment.swiftCode}</td></tr>
                    <tr><td><strong>Beneficiary Name:</strong></td><td>{payment.beneficiaryName}</td></tr>
                    <tr><td><strong>Beneficiary Account:</strong></td><td>{payment.beneficiaryAccount}</td></tr>
                    <tr style={{ fontWeight: 'bold' }}><td><strong>Fees:</strong></td><td>{fees} {payment.currency}</td></tr>
                    <tr style={{ fontWeight: 'bold', color: 'red' }}><td><strong>Total to debit:</strong></td><td>{total} {payment.currency}</td></tr>
                </tbody>
            </table>
            <button onClick={onBack} style={{ marginRight: 10 }}>Back</button>
            <button onClick={onConfirm}>Confirm & Submit</button>
        </div>
    );
};

export default PaymentReviewStep;