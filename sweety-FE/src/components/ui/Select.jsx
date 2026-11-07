export function Select({ label, error, className = '', id, children, ...props }) {
  const selectId = id || props.name;

  return (
    <label className="block" htmlFor={selectId}>
      {label ? (
        <span className="mb-1.5 block text-sm font-medium text-stone-600">{label}</span>
      ) : null}
      <select
        id={selectId}
        className={`w-full rounded-2xl border bg-white/80 px-3.5 py-2.5 text-stone-900 shadow-sm outline-none transition focus:ring-4 ${
          error
            ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
            : 'border-stone-200 focus:border-rose-300 focus:ring-rose-100'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
