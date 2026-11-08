import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';

export function AppShell() {
  return (
    <div className="min-h-svh flex flex-col bg-[#fbf7f2]">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-3 sm:px-6 sm:py-4 lg:py-3">
        <Outlet />
      </main>
    </div>
  );
}
