import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorPayload } from '../../../api/client.js';
import { Button } from '../../../components/ui/Button.jsx';
import { ErrorMessage } from '../../../components/ui/ErrorMessage.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { useToast } from '../../../components/ui/ToastContext.jsx';
import { useAuth } from '../AuthContext.jsx';
import { loginSchema, validateAuth } from '../auth.validation.js';

export function LoginForm() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    // Frontend validation with Zod before making request
    const validation = validateAuth(loginSchema, form);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const user = await login(validation.data);
      toast.success(user?.name ? `Welcome back, ${user.name}!` : 'Logged in successfully!');
      navigate(location.state?.from?.pathname || '/readings', { replace: true });
    } catch (err) {
      const payload = getErrorPayload(err);
      setError(payload);
      toast.error(payload.message, 'Login Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={form.email}
        error={error?.field === 'email'}
        onChange={(event) => {
          setForm((current) => ({ ...current, email: event.target.value }));
          if (error?.field === 'email') setError(null);
        }}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={form.password}
        error={error?.field === 'password'}
        onChange={(event) => {
          setForm((current) => ({ ...current, password: event.target.value }));
          if (error?.field === 'password') setError(null);
        }}
      />
      <ErrorMessage>{error?.message}</ErrorMessage>
      <Button type="submit" className="w-full" loading={loading}>
        Log in
      </Button>
      <p className="text-center text-sm text-stone-500">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-rose-800">
          Create an account
        </Link>
      </p>
    </form>
  );
}
