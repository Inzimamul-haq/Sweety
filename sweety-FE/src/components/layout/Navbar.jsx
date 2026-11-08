import { Activity, Droplets, Menu, Stethoscope, User, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext.jsx';

const patientLinks = [
  { to: '/readings', label: 'Readings', icon: Droplets },
  { to: '/reports', label: 'Reports', icon: Activity },
];

const doctorLinks = [
  { to: '/doctor', label: 'Patients', icon: Stethoscope },
];

export function Navbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const isDoctor = user?.role === 'doctor';
  const links = isDoctor ? doctorLinks : patientLinks;
  const homePath = isDoctor ? '/doctor' : '/readings';

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f6efe6]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink to={homePath} className="flex items-center gap-2 font-display text-xl text-stone-900">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-rose-700 text-white">
            <Droplets className="h-4 w-4" />
          </span>
          <span>Sweety</span>
          {isDoctor ? (
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 font-sans text-xs font-semibold text-rose-800">
              Clinician
            </span>
          ) : null}
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/doctor'}
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
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `inline-flex items-center gap-2.5 rounded-2xl border px-3 py-1.5 text-sm font-medium transition shadow-sm ${
                isActive
                  ? 'border-rose-300 bg-white text-rose-800'
                  : 'border-stone-200/90 bg-white/80 text-stone-700 hover:border-stone-300 hover:bg-white hover:text-stone-900'
              }`
            }
          >
            <span className="grid h-7 w-7 place-items-center rounded-xl bg-rose-100 text-rose-700">
              <User className="h-4 w-4" />
            </span>
            <span className="max-w-36 truncate font-medium">{user?.name || 'Profile'}</span>
          </NavLink>
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
              end={link.to === '/doctor'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-2xl px-3 py-2 text-stone-700 transition ${
                  isActive ? 'bg-white font-medium text-rose-800' : 'hover:bg-white'
                }`
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-2xl px-3 py-2 text-stone-700 transition ${
                isActive ? 'bg-white font-medium text-rose-800' : 'hover:bg-white'
              }`
            }
          >
            <User className="h-4 w-4" />
            Profile ({user?.name || 'Account'})
          </NavLink>
        </div>
      ) : null}
    </header>
  );
}
