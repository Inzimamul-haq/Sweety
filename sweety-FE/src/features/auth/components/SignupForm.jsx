import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorPayload } from '../../../api/client.js';
import { Button } from '../../../components/ui/Button.jsx';
import { ErrorMessage } from '../../../components/ui/ErrorMessage.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { useToast } from '../../../components/ui/ToastContext.jsx';
import { useAuth } from '../AuthContext.jsx';
import { signupSchema, validateAuth } from '../auth.validation.js';

export function SignupForm() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      if (error?.field === field) setError(null);
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Frontend validation with Zod before making request
    const validation = validateAuth(signupSchema, form);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const user = await register(validation.data);
      toast.success(user?.name ? `Account created! Welcome, ${user.name}.` : 'Account created successfully!');
      navigate('/readings', { replace: true });
    } catch (err) {
      const payload = getErrorPayload(err);
      setError(payload);
      toast.error(payload.message, 'Registration Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Name"
        name="name"
        value={form.name}
        error={error?.field === 'name'}
        onChange={update('name')}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={form.email}
        error={error?.field === 'email'}
        onChange={update('email')}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={form.password}
        error={error?.field === 'password'}
        onChange={update('password')}
      />
      <ErrorMessage>{error?.message}</ErrorMessage>
      <Button type="submit" className="w-full" loading={loading}>
        Create account
      </Button>
      <p className="text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-rose-800">
          Log in
        </Link>
      </p>
    </form>
  );
}
