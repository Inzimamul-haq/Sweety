import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/ui/ToastContext.jsx';
import { AuthProvider } from './features/auth/AuthContext.jsx';
import { AppRoutes } from './routes.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
