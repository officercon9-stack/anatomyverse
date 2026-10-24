// @ts-nocheck
import {
  LayoutDashboard,
  Boxes,
  Layers,
  BookOpen,
  GraduationCap,
  Zap,
  Stethoscope,
  Languages,
  ShieldCheck,
  User,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { NavLink, useLocation, Link, Outlet } from 'react-router-dom';
import { useTheme } from '../lib/theme';
import { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';

export var NAV_ITEMS = [
  {
    to: '/app/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    to: '/app/lab',
    label: 'Anatomy lab',
    icon: Boxes,
  },
  {
    to: '/app/systems',
    label: 'Systems',
    icon: Layers,
  },
  {
    to: '/app/lessons',
    label: 'Guided lessons',
    icon: BookOpen,
  },
  {
    to: '/app/quiz',
    label: 'Quiz & exam',
    icon: GraduationCap,
  },
  {
    to: '/app/flashcards',
    label: 'Flashcards',
    icon: Zap,
  },
  {
    to: '/app/clinical',
    label: 'Clinical anatomy',
    icon: Stethoscope,
  },
  {
    to: '/app/dictionary',
    label: 'Dictionary',
    icon: Languages,
  },
];

export function NavList({ onNavigate: e }) {
  let t = useAuthStore((e) => e.user);
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ to: t, label: n, icon: r }) => (
        <NavLink key={t} to={t} className="av-nav-link" onClick={e}>
          <r size={18} aria-hidden /> {n}
        </NavLink>
      ))}
      {t?.role === 'admin' && (
        <NavLink to="/app/admin" className="av-nav-link" onClick={e}>
          <ShieldCheck size={18} aria-hidden />
          {' Content admin'}
        </NavLink>
      )}
    </nav>
  );
}

export function UserBox() {
  let { user: e, backend: t } = useAuthStore();
  return (
    <NavLink to="/app/account" className="av-nav-link">
      <User size={18} aria-hidden />
      <span className="min-w-0 flex-1 truncate">{e ? e.displayName : 'My progress'}</span>
      {false}
    </NavLink>
  );
}

export function ThemeToggle() {
  let [e, t] = useTheme();
  let n = e === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="av-btn av-btn--ghost av-btn--sm"
      onClick={() => t(n)}
      aria-label={`Switch to ${n} theme`}
    >
      {e === 'dark' ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
    </button>
  );
}

export function AppLayout() {
  let [e, t] = useState(false);
  let n = useLocation();
  useEffect(() => t(false), [n.pathname]);
  let r = n.pathname.startsWith('/app/lab') || /\/app\/lessons\/.+/.test(n.pathname);
  return (
    <div className="flex h-full min-h-0">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 av-btn">
        Skip to content
      </a>
      <aside className="av-panel hidden w-60 shrink-0 flex-col border-r p-3 lg:flex">
        <div className="mb-4 flex items-center justify-between px-1">
          <Link to="/" aria-label="AnatomyVerse 3D home">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
        <NavList />
        <div className="mt-auto flex flex-col gap-2 border-t border-[var(--av-border)] pt-3">
          <UserBox />
          <p className="px-2 text-[11px] leading-snug text-[var(--av-text-faint)]">
            {'For education only — not a substitute for formal training. '}
            <Link className="underline" to="/legal/disclaimer">
              Disclaimer
            </Link>
          </p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="av-panel flex h-14 shrink-0 items-center justify-between border-b px-3 lg:hidden">
          <Link to="/" aria-label="AnatomyVerse 3D home">
            <Logo compact />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              className="av-btn av-btn--ghost av-btn--sm"
              aria-label="Open menu"
              aria-expanded={e}
              onClick={() => t(true)}
            >
              <Menu size={20} aria-hidden />
            </button>
          </div>
        </header>
        {e && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Main menu">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Close menu"
              onClick={() => t(false)}
            />
            <div className="av-panel absolute right-0 top-0 flex h-full w-72 max-w-[85vw] flex-col gap-3 border-l p-3">
              <div className="flex items-center justify-between">
                <Logo compact />
                <button
                  type="button"
                  className="av-btn av-btn--ghost av-btn--sm"
                  aria-label="Close menu"
                  onClick={() => t(false)}
                >
                  <X size={20} aria-hidden />
                </button>
              </div>
              <NavList onNavigate={() => t(false)} />
              <div className="mt-auto">
                <UserBox />
              </div>
            </div>
          </div>
        )}
        <main id="main" className={`min-h-0 flex-1 ${r ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
