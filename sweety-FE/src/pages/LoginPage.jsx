import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { LoginForm } from '../features/auth/components/LoginForm.jsx';

export function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-rose-800 p-10 text-rose-50 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-700" />
        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-rose-900/60" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 font-display text-2xl">
            <Droplets className="h-5 w-5" />
            Sweety
          </p>
          <h1 className="mt-16 max-w-sm font-display text-5xl leading-tight">
            Four readings. A clearer day.
          </h1>
          <p className="mt-4 max-w-sm text-rose-100">
            Track fasting and meal-time glucose, then see daily and monthly patterns without the clutter.
          </p>
        </div>
        <div className="relative space-y-1 text-sm text-rose-200">
          <p>Patient demo: demo@sweety.app / Demo12345</p>
          <p>Doctor demo: doctor@sweety.app / Demo12345</p>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-stone-200/80 sm:p-8"
        >
          <h2 className="font-display text-3xl text-stone-900">Welcome back</h2>
          <p className="mt-2 mb-6 text-sm text-stone-500">Log in to continue to your dashboard.</p>
          <LoginForm />
        </motion.div>
      </section>
    </div>
  );
}
