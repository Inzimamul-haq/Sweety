import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';

export function AppShell() {
  return (
    <div className="min-h-svh">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
