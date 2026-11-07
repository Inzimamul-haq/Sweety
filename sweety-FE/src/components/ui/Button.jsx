import { LoaderCircle } from 'lucide-react';

const variants = {
  primary:
    'bg-rose-700 text-white shadow-sm hover:bg-rose-800 focus-visible:ring-rose-700/40',
  secondary:
    'bg-white text-stone-800 ring-1 ring-stone-200 hover:bg-stone-50 focus-visible:ring-stone-400/40',
  ghost: 'bg-transparent text-stone-600 hover:bg-stone-100',
  danger:
    'bg-rose-50 text-rose-800 ring-1 ring-rose-100 hover:bg-rose-100 focus-visible:ring-rose-700/30',
};

export function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
