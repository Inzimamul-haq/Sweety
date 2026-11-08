import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext.jsx';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-stone-500">
        Loading Sweety…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'doctor' ? '/doctor' : '/readings'} replace />;
  }

  return children;
}
