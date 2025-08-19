
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute: React.FC = () => {
    const { isAuthenticated, profile } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (profile?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;
