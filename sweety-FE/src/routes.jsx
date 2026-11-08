import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.jsx';
import { DoctorSignupGuard } from './components/layout/DoctorSignupGuard.jsx';
import { GuestRoute } from './components/layout/GuestRoute.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { useAuth } from './features/auth/AuthContext.jsx';
import { DoctorAccessCodePage } from './pages/DoctorAccessCodePage.jsx';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage.jsx';
import { DoctorPatientReportsPage } from './pages/DoctorPatientReportsPage.jsx';
import { DoctorSignupDetailsPage } from './pages/DoctorSignupDetailsPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { ReadingsPage } from './pages/ReadingsPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { SignupPage } from './pages/SignupPage.jsx';

export function AppRoutes() {
  const { user } = useAuth();
  const defaultHome = user?.role === 'doctor' ? '/doctor' : '/readings';

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
        path="/register"
        element={
          <GuestRoute>
            <SignupPage />
          </GuestRoute>
        }
      />
      <Route
        path="/doctor-signup"
        element={
          <GuestRoute>
            <DoctorAccessCodePage />
          </GuestRoute>
        }
      />
      <Route
        path="/doctor-signup/details"
        element={
          <DoctorSignupGuard>
            <DoctorSignupDetailsPage />
          </DoctorSignupGuard>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route
          path="/readings"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <ReadingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients/:patientId/reports"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorPatientReportsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to={defaultHome} replace />} />
    </Routes>
  );
}
