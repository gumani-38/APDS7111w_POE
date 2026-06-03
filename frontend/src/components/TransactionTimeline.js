import React from 'react';

const timelineSteps = ['Initiated', 'Compliance Check', 'Sent to SWIFT', 'Beneficiary Bank', 'Completed'];
const statusToIndex = { 'pending': 0, 'compliance': 1, 'verified': 2, 'sent': 3, 'settled': 4, 'rejected': -1 };

const TransactionTimeline = ({ currentStatus }) => {
    const activeIndex = statusToIndex[currentStatus?.toLowerCase()] ?? 0;
    if (currentStatus === 'rejected') {
        return <div style={{ margin: '20px 0', padding: 10, background: '#ffebee', borderRadius: 8 }}><strong style={{ color: 'red' }}>Payment rejected</strong> – no further processing.</div>;
    }
    return (
        <div style={{ margin: '20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                {timelineSteps.map((step, idx) => (
                    <div key={idx} style={{ textAlign: 'center', flex: 1, minWidth: 80 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', margin: '0 auto', backgroundColor: idx <= activeIndex ? '#4caf50' : '#ccc', color: 'white', lineHeight: '30px', fontSize: 14 }}>{idx + 1}</div>
                        <small>{step}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionTimeline;