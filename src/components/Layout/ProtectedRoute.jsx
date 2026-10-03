import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Guards any route tree that requires an authenticated session.
 * Unauthenticated users are redirected to /login; the original
 * destination is saved in location state so LoginPage can redirect
 * back after a successful sign-in.
 *
 * Usage (in App.jsx):
 *   <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
 *     ...child routes...
 *   </Route>
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While the auth context is resolving (e.g. reading from sessionStorage),
  // render nothing to avoid a flash of the login page.
  if (loading) {
    return (
      <div role="status" aria-live="polite" style={{ padding: '2rem', textAlign: 'center' }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    // Preserve the intended destination so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
