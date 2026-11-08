/* eslint-disable react-refresh/only-export-components */
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', message, title, duration = 4500 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast = { id, type, message, title };

      setToasts((current) => [...current.slice(-4), newToast]); // keep max 5 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast],
  );

  const toast = useMemo(
    () => ({
      success: (message, title) => addToast({ type: 'success', message, title }),
      error: (message, title) => addToast({ type: 'error', message, title }),
      info: (message, title) => addToast({ type: 'info', message, title }),
      dismiss: removeToast,
    }),
    [addToast, removeToast],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-2 p-4 sm:top-0 sm:right-0 sm:p-6"
      >
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 transition ${
                item.type === 'error'
                  ? 'ring-rose-200 text-stone-900 border-l-4 border-l-rose-600'
                  : item.type === 'success'
                    ? 'ring-emerald-200 text-stone-900 border-l-4 border-l-emerald-600'
                    : 'ring-stone-200 text-stone-900 border-l-4 border-l-sky-600'
              }`}
            >
              {item.type === 'error' && (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              )}
              {item.type === 'success' && (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              )}
              {item.type === 'info' && (
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
              )}

              <div className="min-w-0 flex-1">
                {item.title ? (
                  <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                ) : null}
                <p className="text-sm font-medium text-stone-700">{item.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

