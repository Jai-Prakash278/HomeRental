import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isLoggedIn, user, loading } = useContext(AuthContext);

    // Show a loading spinner while session is being verified
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium">Verifying access...</p>
            </div>
        );
    }

    // If not logged in, redirect to login page
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // If roles are specified and user's role is not allowed, redirect them safely
    if (allowedRoles && !allowedRoles.includes(user?.userType)) {
        if (user?.userType === 'host') {
            return <Navigate to="/host/dashboard" replace />;
        } else {
            return <Navigate to="/explore" replace />;
        }
    }

    // User is authorized, render the protected component
    return children;
};

export default ProtectedRoute;
