import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.jsx';
import { GuestRoute } from './components/layout/GuestRoute.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { ReadingsPage } from './pages/ReadingsPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { SignupPage } from './pages/SignupPage.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignupPage />
          </GuestRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/readings" element={<ReadingsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/readings" replace />} />
    </Routes>
  );
}
