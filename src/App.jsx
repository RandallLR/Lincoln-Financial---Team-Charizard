import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Layout/ProtectedRoute';

// Public pages
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected pages
import DashboardPage from './pages/DashboardPage';
import BenefitsPage from './pages/BenefitsPage';
import DentalAssistancePage from './pages/DentalAssistancePage';
import ProfilePage from './pages/ProfilePage';
import LifeEventPage from './pages/LifeEventPage';

/**
 * Route map:
 *
 * /                    → redirect → /dashboard (if authed) or /login
 * /login               → LoginPage           (public)
 * /dashboard           → DashboardPage       (protected)
 * /benefits            → BenefitsPage        (protected)
 * /benefits/dental     → DentalAssistancePage (protected) — hosts the Dental API
 * /profile             → ProfilePage         (protected)
 * *                    → NotFoundPage
 */
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected — all wrapped in the shared Layout (Navbar + Footer) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/benefits" element={<BenefitsPage />} />
        <Route path="/benefits/dental" element={<DentalAssistancePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/life-event" element={<LifeEventPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
