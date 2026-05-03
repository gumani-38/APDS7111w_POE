import api from './api';

// Customer registration
export const register = async (userData) => {
    const response = await api.post('/user/register', userData);
    return response.data;
};

// Step 1: password login → sends OTP
export const login = async (username, password) => {
    const response = await api.post('/user/login', { username, password });
    return response.data;
};

// Step 2: verify OTP and complete login (cookie set)
export const verifyOtp = async (username, otp) => {
    const response = await api.post('/user/verify-otp', { username, otp });
    return response.data;
};

// Employee login
export const employeeLogin = async (employeeNumber, password) => {
    const response = await api.post('/employee/login', { employeeNumber, password });
    return response.data;
};

// Logout (clears cookie on backend)
export const logout = async () => {
    await api.post('/logout');
};

// Optional: get current logged-in user (if endpoint exists)
export const getCurrentUser = async () => {
    try {
        const response = await api.get('/user/me');
        return response.data;
    } catch {
        return null;
    }
};