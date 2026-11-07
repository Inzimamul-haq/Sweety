export function Input({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name;

  return (
    <label className="block" htmlFor={inputId}>
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-stone-600">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={`w-full rounded-2xl border bg-white/80 px-3.5 py-2.5 text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:ring-4 ${
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-stone-200 focus:border-rose-300 focus:ring-rose-100'
        } ${className}`}
        {...props}
      />
    </label>
  );
}
