import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button.jsx';

export function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  icon: Icon = AlertTriangle,
  loading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  const modalContent = (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs"
            onClick={loading ? undefined : onClose}
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', duration: 0.25, bounce: 0.1 }}
            className="relative z-10 w-full max-w-md rounded-3xl bg-[#fbf7f2] p-6 shadow-2xl ring-1 ring-stone-200/80"
          >
            <div className="flex items-start gap-4">
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                  confirmVariant === 'danger'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-stone-900">
                    {title}
                  </h3>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button
                variant={confirmVariant}
                loading={loading}
                onClick={onConfirm}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return modalContent;
  return createPortal(modalContent, document.body);
}

