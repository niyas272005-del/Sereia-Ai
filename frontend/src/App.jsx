import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/ToastContext';
import { ThemeProvider } from './components/common/ThemeProvider';
import AuthLayout from './components/layouts/AuthLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Chat from './pages/dashboard/Chat';
import DashboardHome from './pages/dashboard/DashboardHome';
import MoodTracker from './pages/dashboard/MoodTracker';
import Journal from './pages/dashboard/Journal';
import Assessments from './pages/dashboard/Assessments';
import Wellness from './pages/dashboard/Wellness';
import Analytics from './pages/dashboard/Analytics';
import Reports from './pages/dashboard/Reports';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';
import { ProfileProvider } from './components/common/ProfileContext';
import { MoodProvider } from './components/common/MoodContext';
import { DataProvider } from './components/common/DataContext';


function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <ToastProvider>
          <BrowserRouter>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route index element={<Navigate to="/auth/login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
            </Route>
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<MoodProvider><DataProvider><DashboardLayout /></DataProvider></MoodProvider>}>
              <Route index element={<DashboardHome />} />
              <Route path="chat" element={<Chat />} />
              <Route path="mood" element={<MoodTracker />} />
              <Route path="journal" element={<Journal />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="wellness" element={<Wellness />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              {/* Future routes will go here */}
              <Route path="*" element={<DashboardHome />} />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;
