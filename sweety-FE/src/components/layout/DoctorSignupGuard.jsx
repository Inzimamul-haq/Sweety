import { Navigate } from 'react-router-dom';
import { DOCTOR_SIGNUP_TOKEN_KEY, useAuth } from '../../features/auth/AuthContext.jsx';

export function DoctorSignupGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-stone-500">
        Loading Sweety…
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/readings'} replace />;
  }

  const signupToken = sessionStorage.getItem(DOCTOR_SIGNUP_TOKEN_KEY);
  if (!signupToken) {
    return <Navigate to="/doctor-signup" replace />;
  }

  return children;
}

