import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth';

function ProtectedRoute({ children, userType }) {
    const user = authService.getCurrentUser();
    const employee = authService.getCurrentEmployee();
    
    // Check authentication based on user type
    if (userType === 'customer' && !user) {
        return <Navigate to="/customer/login" />;
    }
    
    if (userType === 'employee' && !employee) {
        return <Navigate to="/employee/login" />;
    }
    
    return children;
}

export default ProtectedRoute;