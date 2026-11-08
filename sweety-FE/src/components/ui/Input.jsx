import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export function Input({
  label,
  error,
  className = '',
  id,
  type = 'text',
  showPasswordToggle,
  ...props
}) {
  const inputId = id || props.name;
  const [visible, setVisible] = useState(false);

  const canTogglePassword =
    type === 'password' && (showPasswordToggle ?? props.name === 'password');
  const resolvedType = canTogglePassword ? (visible ? 'text' : 'password') : type;

  return (
    <label className="block" htmlFor={inputId}>
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-stone-600">{label}</span>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          type={resolvedType}
          className={`w-full rounded-2xl border bg-white/80 px-3.5 py-2.5 ${
            canTogglePassword ? 'pr-10' : ''
          } text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:ring-4 ${
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
              : 'border-stone-200 focus:border-rose-300 focus:ring-rose-100'
          } ${className}`}
          {...props}
        />
        {canTogglePassword ? (
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition cursor-pointer"
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </div>
    </label>
  );
}
