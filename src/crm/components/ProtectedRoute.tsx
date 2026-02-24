import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('auth_token');
    const isAuthenticated = token && token.startsWith('autopage_');
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect them to the /crm/login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/crm/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
