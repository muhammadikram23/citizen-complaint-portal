import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm font-medium text-slate-500 animate-pulse">
          Authenticating session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    // If officer tries to visit citizen route or citizen tries officer route
    return <Navigate to={user?.role === 'officer' ? '/officer/dashboard' : '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
