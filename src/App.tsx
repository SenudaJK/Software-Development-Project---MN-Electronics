import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RepairStatusPage from './pages/repairs/RepairStatusPage';
import NewBookingPage from './pages/booking/NewBookingPage';
import BookingConfirmationPage from './pages/booking/BookingConfirmationPage';
import ProfilePage from './pages/account/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="repair-status" element={<RepairStatusPage />} />
            
            {/* Protected Routes */}
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="new-booking" element={
              <ProtectedRoute>
                <NewBookingPage />
              </ProtectedRoute>
            } />
            <Route path="booking-confirmation" element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            } />
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;