import { motion } from 'framer-motion';
import { CheckCircle2, Droplets } from 'lucide-react';
import { SignupForm } from '../features/auth/components/SignupForm.jsx';

export function SignupPage() {
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
            Start a calm glucose journal.
          </h1>
          <p className="mt-4 max-w-sm text-rose-100">
            One account, your readings only. Morning, breakfast, lunch and dinner — never more than four a day.
          </p>

          <div className="mt-10 space-y-3 text-sm text-rose-100">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-rose-300 shrink-0" />
              <span>Private & secure encrypted data</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-rose-300 shrink-0" />
              <span>Instant daily & monthly trend reports</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-rose-300 shrink-0" />
              <span>Clean, calm layout without clutter</span>
            </div>
          </div>
        </div>

        <p className="relative text-sm text-rose-200">Ready in seconds. No complex setup.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-stone-200/80 sm:p-8"
        >
          <h2 className="font-display text-3xl text-stone-900">Create account</h2>
          <p className="mt-2 mb-6 text-sm text-stone-500">Name, email and a password. That’s it.</p>
          <SignupForm />
        </motion.div>
      </section>
    </div>
  );
}
