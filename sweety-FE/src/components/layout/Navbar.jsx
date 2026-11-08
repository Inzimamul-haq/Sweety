import { Activity, Droplets, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { Button } from '../ui/Button.jsx';
import { ConfirmModal } from '../ui/ConfirmModal.jsx';

const links = [
  { to: '/readings', label: 'Readings', icon: Droplets },
  { to: '/reports', label: 'Reports', icon: Activity },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function handleConfirmLogout() {
    setShowLogoutConfirm(false);
    setOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f6efe6]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to="/readings" className="flex items-center gap-2 font-display text-xl text-stone-900">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-rose-700 text-white">
            <Droplets className="h-4 w-4" />
          </span>
          Sweety
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-rose-800 shadow-sm'
                    : 'text-stone-600 hover:bg-white/70'
                }`
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <p className="max-w-40 truncate text-sm text-stone-500">{user?.name}</p>
          <Button variant="secondary" onClick={() => setShowLogoutConfirm(true)}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>

        <button
          type="button"
          className="rounded-2xl p-2 text-stone-700 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="space-y-2 border-t border-stone-200 px-4 py-3 md:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-2xl px-3 py-2 text-stone-700 hover:bg-white"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
          <Button variant="secondary" className="w-full" onClick={() => setShowLogoutConfirm(true)}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Log Out?"
        description="Are you sure you want to log out of your Sweety account?"
        confirmText="Log Out"
        confirmVariant="primary"
        icon={LogOut}
        onConfirm={handleConfirmLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </header>
  );
}
