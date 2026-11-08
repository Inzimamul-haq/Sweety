import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Droplets, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorPayload } from '../api/client.js';
import { Button } from '../components/ui/Button.jsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useToast } from '../components/ui/ToastContext.jsx';
import { DOCTOR_SIGNUP_TOKEN_KEY, useAuth } from '../features/auth/AuthContext.jsx';
import { signupSchema, validateAuth } from '../features/auth/auth.validation.js';

export function DoctorSignupDetailsPage() {
  const { registerDoctor } = useAuth();
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

    const validation = validateAuth(signupSchema, form);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    const signupToken = sessionStorage.getItem(DOCTOR_SIGNUP_TOKEN_KEY);
    if (!signupToken) {
      toast.error('Your verification session expired. Please re-enter the access code.');
      navigate('/doctor-signup', { replace: true });
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const user = await registerDoctor(validation.data, signupToken);
      toast.success(`Welcome, ${user.name}! Your clinician account is ready.`);
      navigate('/doctor', { replace: true });
    } catch (err) {
      const payload = getErrorPayload(err);
      if (err?.response?.status === 401 || payload.field === 'token') {
        sessionStorage.removeItem(DOCTOR_SIGNUP_TOKEN_KEY);
        toast.error(payload.message, 'Session Expired');
        navigate('/doctor-signup', { replace: true });
        return;
      }
      setError(payload);
      toast.error(payload.message, 'Registration Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-stone-900 p-10 text-stone-100 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-900/50" />
        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-stone-800" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 font-display text-2xl text-white">
            <Droplets className="h-5 w-5 text-rose-400" />
            Sweety Clinician Portal
          </p>
          <h1 className="mt-16 max-w-sm font-display text-5xl leading-tight text-white">
            Complete your clinician profile.
          </h1>
          <p className="mt-4 max-w-sm text-stone-300">
            Your access code has been verified. Create your clinician credentials to begin linking and monitoring patients.
          </p>
        </div>
        <p className="relative text-sm text-stone-400">Step 2 of 2 · Clinician Details</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl bg-white/85 p-6 shadow-sm ring-1 ring-stone-200/80 sm:p-8"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Access Code Verified
          </div>
          <h2 className="font-display text-3xl text-stone-900">Clinician details</h2>
          <p className="mt-2 mb-6 text-sm text-stone-500">
            Enter your full name, clinical email, and password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full Name (e.g. Dr. Jane Doe)"
              name="name"
              placeholder="Dr. Jane Doe"
              value={form.name}
              error={error?.field === 'name'}
              onChange={update('name')}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="doctor@clinic.org"
              value={form.email}
              error={error?.field === 'email'}
              onChange={update('email')}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              error={error?.field === 'password'}
              onChange={update('password')}
            />
            <ErrorMessage>{error?.message}</ErrorMessage>

            <Button type="submit" className="w-full" loading={loading}>
              <Stethoscope className="h-4 w-4" />
              Create Clinician Account
            </Button>

            <div className="pt-2 text-center">
              <Link
                to="/doctor-signup"
                onClick={() => sessionStorage.removeItem(DOCTOR_SIGNUP_TOKEN_KEY)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Use a different code
              </Link>
            </div>
          </form>
        </motion.div>
      </section>
    </div>
  );
}

