import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext.jsx';

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-stone-500">
        Loading Sweety…
      </div>
    );
  }

  if (user) {
    return <Navigate to="/readings" replace />;
  }

  return children;
}
