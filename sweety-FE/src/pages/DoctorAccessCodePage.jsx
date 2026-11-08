import { motion } from 'framer-motion';
import { ArrowLeft, Droplets, KeyRound, ShieldCheck, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorPayload } from '../api/client.js';
import { Button } from '../components/ui/Button.jsx';
import { ErrorMessage } from '../components/ui/ErrorMessage.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useToast } from '../components/ui/ToastContext.jsx';
import { DOCTOR_SIGNUP_TOKEN_KEY } from '../features/auth/AuthContext.jsx';
import { verifyDoctorAccessCode } from '../features/auth/auth.api.js';
import { doctorAccessCodeSchema, validateAuth } from '../features/auth/auth.validation.js';

export function DoctorAccessCodePage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  async function handleSubmit(event) {
    event.preventDefault();

    const validation = validateAuth(doctorAccessCodeSchema, { code });
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await verifyDoctorAccessCode(validation.data.code);
      sessionStorage.setItem(DOCTOR_SIGNUP_TOKEN_KEY, result.signupToken);
      toast.success('Access code verified. Complete your clinician account.');
      navigate('/doctor-signup/details', { replace: true });
    } catch (err) {
      const payload = getErrorPayload(err);
      setError({ message: payload.message || 'Invalid access code.', field: 'code' });
      toast.error(payload.message || 'Invalid access code.', 'Verification Failed');
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
            Verified access for care teams.
          </h1>
          <p className="mt-4 max-w-sm text-stone-300">
            Review linked patients’ daily logs, 7-day trends, and monthly summaries in a dedicated read-only clinical workspace.
          </p>

          <div className="mt-10 space-y-3 text-sm text-stone-300">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-rose-400 shrink-0" />
              <span>Protected by clinician authorization code</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Stethoscope className="h-4 w-4 text-rose-400 shrink-0" />
              <span>Read-only patient glucose analytics</span>
            </div>
          </div>
        </div>
        <p className="relative text-sm text-stone-400"> Step 1 of 2 · Access Code Verification</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl bg-white/85 p-6 shadow-sm ring-1 ring-stone-200/80 sm:p-8"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
            <KeyRound className="h-3.5 w-3.5" />
            Clinician Verification
          </div>
          <h2 className="font-display text-3xl text-stone-900">Enter access code</h2>
          <p className="mt-2 mb-6 text-sm text-stone-500">
            Enter the clinician invitation code provided by your administrator to unlock doctor registration.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Access Code"
              name="code"
              type="password"
              placeholder="Enter clinician access code"
              value={code}
              error={Boolean(error)}
              onChange={(event) => {
                setCode(event.target.value);
                if (error) setError(null);
              }}
              autoFocus
            />
            <ErrorMessage>{error?.message}</ErrorMessage>

            <Button type="submit" className="w-full" loading={loading}>
              Verify & Continue
            </Button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </form>
        </motion.div>
      </section>
    </div>
  );
}

