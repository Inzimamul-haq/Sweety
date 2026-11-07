import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import { SignupForm } from '../features/auth/components/SignupForm.jsx';

export function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-stone-900 p-10 text-stone-100 lg:flex lg:flex-col lg:justify-between">
        <p className="inline-flex items-center gap-2 font-display text-2xl">
          <Droplets className="h-5 w-5" />
          Sweety
        </p>
        <div>
          <h1 className="max-w-sm font-display text-5xl leading-tight">Start a calm glucose journal.</h1>
          <p className="mt-4 max-w-sm text-stone-300">
            One account, your readings only. Morning, breakfast, lunch and dinner — never more than four a day.
          </p>
        </div>
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
