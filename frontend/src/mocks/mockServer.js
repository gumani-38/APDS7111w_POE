import MockAdapter from 'axios-mock-adapter';
import api from '../services/api';

const mock = new MockAdapter(api, { delayResponse: 500 });

// ---- Mock data ----
let payments = [
    { 
        id: 1, 
        amount: 500, 
        currency: 'USD', 
        payee_name: 'Acme Corporation',
        payee_account: 'US1234567890', 
        swift_code: 'BOFAUS3N', 
        status: 'settled', 
        created_at: '2026-04-25T10:00:00Z' 
    },
    { 
        id: 2, 
        amount: 1200, 
        currency: 'EUR', 
        payee_name: 'EuroTech GmbH', 
        payee_account: 'DE9876543210', 
        swift_code: 'DEUTDEFF', 
        status: 'pending', 
        created_at: '2026-04-26T14:30:00Z' 
    },
];
let pendingPayments = [];

// ---- Auth endpoints (always succeed) ----
mock.onPost('/user/register').reply(200, { message: 'Customer registered successfully' });
mock.onPost('/user/login').reply(200, { message: 'OTP sent to your email' });
mock.onPost('/user/verify-otp').reply(200, { message: 'Login successful' });
mock.onPost('/employee/login').reply(200, { message: 'Employee login successful' });
mock.onPost('/logout').reply(200, {});

// ---- Balance endpoint (returns a dummy balance) ----
mock.onGet('/user/balance').reply((config) => {
    const currency = config.params?.currency || 'USD';
    const rates = { USD: 1, EUR: 0.92, GBP: 0.79, ZAR: 18.5 };
    const balance = 12500.00; // dummy balance in USD
    const converted = balance * (rates[currency] || 1);
    return [200, { convertedBalance: converted, baseCurrency: 'USD', targetCurrency: currency }];
});

// ---- Payments endpoints ----
mock.onGet('/payments').reply(200, payments);
mock.onPost('/payments').reply((config) => {
    const body = JSON.parse(config.data);
    const newPayment = {
        id: payments.length + 1,
        amount: parseFloat(body.amount),
        currency: body.currency,
        payee_name: body.beneficiaryName,
        payee_account: body.beneficiaryAccount,
        swift_code: body.swiftCode,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    payments.unshift(newPayment);
    return [200, { message: 'Payment created', id: newPayment.id }];
});

// ---- Employee pending payments ----
mock.onGet('/employee/pending-payments').reply((config) => {
    let filtered = pendingPayments;
    const { status, currency, search } = config.params || {};
    if (status) filtered = filtered.filter(p => p.status === status);
    if (currency) filtered = filtered.filter(p => p.currency === currency);
    if (search) filtered = filtered.filter(p => p.id.toString().includes(search) || p.customerName?.toLowerCase().includes(search.toLowerCase()));
    return [200, filtered];
});

// ---- Employee actions ----
mock.onPost(/\/employee\/payments\/\d+\/verify/).reply((config) => {
    const id = parseInt(config.url.split('/')[3]);
    const payment = pendingPayments.find(p => p.id === id);
    if (payment) payment.status = 'verified';
    return [200, { message: 'Verified' }];
});
mock.onPost(/\/employee\/payments\/\d+\/reject/).reply((config) => {
    const id = parseInt(config.url.split('/')[3]);
    const payment = pendingPayments.find(p => p.id === id);
    if (payment) payment.status = 'rejected';
    return [200, { message: 'Rejected' }];
});
mock.onPost(/\/employee\/payments\/\d+\/submit/).reply(200, { uetr: 'e8025678-1234-5678-9abc-def012345678' });

export default mock;