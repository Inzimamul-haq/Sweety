export function ErrorMessage({ children }) {
  if (!children) return null;

  return (
    <p className="mt-1.5 text-sm font-medium text-rose-700" role="alert">
      {children}
    </p>
  );
}
