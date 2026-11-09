import { NavLink, Outlet, Link } from 'react-router-dom';
import { BarChart3, BookMarked, Dumbbell, Home, Map, Settings, ShoppingBag, CalendarDays, GraduationCap } from 'lucide-react';
import { useStore } from '@/state/store';
import { Avatar } from './ui';

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/learn', label: 'Learn', icon: Map },
  { to: '/practice', label: 'Practice', icon: Dumbbell },
  { to: '/notebook', label: 'Notebook', icon: BookMarked },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
];

export function TopBar() {
  const streak = useStore((s) => s.streak);
  const coins = useStore((s) => s.coins);
  const p = useStore((s) => s.profile);
  return (
    <div className="flex items-center gap-2">
      <Link to="/progress" className="chip bg-surface border border-line text-sm py-1.5" aria-label={`${streak.current}-day streak`}>
        <span className={streak.current ? '' : 'grayscale opacity-60'}>🔥</span> {streak.current}
        {streak.freezes > 0 && <span className="ml-1 text-sky" title={`${streak.freezes} streak protector(s)`}>🧊{streak.freezes}</span>}
      </Link>
      <Link to="/shop" className="chip bg-surface border border-line text-sm py-1.5" aria-label={`${coins} coins`}>🪙 {coins}</Link>
      <Link to="/settings" aria-label="Profile and settings"><Avatar avatarId={p.avatarId} frameId={p.frameId} size={38} /></Link>
    </div>
  );
}

export function Layout() {
  const school = useStore((s) => s.profile.schoolMode);
  const extra = [
    ...(school ? [{ to: '/school', label: 'School (QCE)', icon: GraduationCap }] : []),
    { to: '/planner', label: 'Planner', icon: CalendarDays },
    { to: '/shop', label: 'Boutique', icon: ShoppingBag },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];
  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 sticky top-0 h-dvh border-r border-line bg-surface/60 px-4 py-6">
        <Link to="/" className="flex items-center gap-2 px-3 mb-8">
          <img src="/icon.svg" alt="" className="h-9 w-9" />
          <span className="font-display text-2xl font-bold italic">Allez&nbsp;!</span>
        </Link>
        <nav className="grid gap-1">
          {[...NAV, ...extra].map((n) => (
            <NavLink key={n.to} to={n.to} end={'end' in n ? Boolean(n.end) : false}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 font-extrabold transition ${isActive ? 'bg-primary/12 text-primary' : 'text-ink-soft hover:bg-surface-2'}`}>
              <n.icon size={20} /> {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 bg-bg/90 backdrop-blur safe-top border-b border-line/60 lg:border-none">
          <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
            <Link to="/" className="lg:invisible flex items-center gap-2">
              <img src="/icon.svg" alt="" className="h-8 w-8" />
              <span className="font-display text-xl font-bold italic">Allez&nbsp;!</span>
            </Link>
            <TopBar />
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 pt-4 pb-28 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile tab bar */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-surface/95 backdrop-blur border-t border-line safe-bottom" aria-label="Main">
        <div className="mx-auto max-w-lg grid grid-cols-5">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold ${isActive ? 'text-primary' : 'text-ink-soft'}`}>
              {({ isActive }) => (
                <>
                  <span className={`grid place-items-center h-8 w-12 rounded-full transition ${isActive ? 'bg-primary/12' : ''}`}><n.icon size={22} strokeWidth={isActive ? 2.6 : 2} /></span>
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
