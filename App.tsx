import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useStore } from './store/useStore';
import { Sidebar, MobileHeader } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { SummaryPage } from './pages/SummaryPage';
import { CalendarPage } from './pages/CalendarPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { CustomersPage } from './pages/CustomersPage';
import { ServicesPage } from './pages/ServicesPage';
import { StaffPage } from './pages/StaffPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SessionTrackingPage } from './pages/SessionTrackingPage';
import { AgendaPage } from './pages/AgendaPage';

// Wrapper for protected routes
const ProtectedLayout = () => {
  const { isAuthenticated, isSidebarExpanded } = useStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      {/* 
         Adjusted left margin:
         - Default collapsed: md:ml-20 (80px)
         - Expanded: md:ml-64 (256px)
         - Transition matches Sidebar transition
      */}
      <main 
        className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        <MobileHeader title="Randevu Asistanı" />
        <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<SummaryPage />} />
          <Route path="/transactions" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/sessions" element={<SessionTrackingPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;