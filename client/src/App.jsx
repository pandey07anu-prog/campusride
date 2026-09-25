import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import initMotion from './motion-init';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import VerifyAccountPage from './pages/VerifyAccountPage';
import UserDashboardPage from './pages/UserDashboardPage';
import FindRidePage from './pages/FindRidePage';
import OfferRidePage from './pages/OfferRidePage';
import RideDetailPage from './pages/RideDetailPage';
import MyRidesPage from './pages/MyRidesPage';
import StudentVerificationPage from './pages/StudentVerificationPage';
import ProfilePage from './pages/ProfilePage';
import EnvironmentalImpactPage from './pages/EnvironmentalImpactPage';
import NotificationsPage from './pages/NotificationsPage';
import GoingNowPage from './pages/GoingNowPage';
import ManageRequestsPage from './pages/ManageRequestsPage';
import SafetyCenterPage from './pages/SafetyCenterPage';
import AdminDashboard from './pages/admin/AdminDashboard';

import ErrorBoundary from './components/common/ErrorBoundary';
import BackButtonHandler from './components/common/BackButtonHandler';
import IosInstallPrompt from './components/common/IosInstallPrompt';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

function MotionInit() {
  const location = useLocation();
  useEffect(() => {
    initMotion();
  }, [location.pathname]);
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <BackButtonHandler />
        <AuthProvider>
          <NotificationProvider>
            <MotionInit />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/verify-account" element={<VerifyAccountPage />} />
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/find-ride" element={<FindRidePage />} />
              <Route path="/offer-ride" element={<OfferRidePage />} />
              <Route path="/ride/:id" element={<RideDetailPage />} />
              <Route path="/my-rides" element={<MyRidesPage />} />
              <Route path="/student-verification" element={<StudentVerificationPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/environmental-impact" element={<EnvironmentalImpactPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/going-now" element={<GoingNowPage />} />
              <Route path="/manage-requests" element={<ManageRequestsPage />} />
              <Route path="/safety-center" element={<SafetyCenterPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
            <IosInstallPrompt />
            <Analytics />
            <SpeedInsights />
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
