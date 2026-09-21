import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import {
  ChartNoAxesColumn,
  ExternalLink,
  FileText,
  LogOut,
  Mail,
  Menu,
  Moon,
  Sun,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Overview from '../dashboard/Overview.jsx';
import Visitors from '../dashboard/Visitors.jsx';
import Leads from '../dashboard/Leads.jsx';
import Inbox from '../dashboard/Inbox.jsx';
import Content from '../dashboard/Content.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useScrollLock, useTheme } from '../hooks/index.js';
import api from '../lib/api.js';
import { useProfile } from '../lib/content.jsx';
import { Avatar } from '../dashboard/common.jsx';

const LINKS = [
  { to: '/dashboard', label: 'Overview', icon: ChartNoAxesColumn, end: true },
  { to: '/dashboard/visitors', label: 'Visitors', icon: Users },
  { to: '/dashboard/leads', label: 'Leads', icon: UserCheck },
  { to: '/dashboard/inbox', label: 'Inbox', icon: Mail, badge: 'unread' },
  { to: '/dashboard/content', label: 'Content', icon: FileText },
];

export default function Dashboard() {
  const { admin, logout } = useAuth();
  const profile = useProfile();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useScrollLock(menuOpen);

  // Keeps the inbox badge honest without the Inbox page having to be open.
  useEffect(() => {
    const poll = () =>
      api
        .get('/analytics/overview?range=all')
        .then((data) => setUnread(data.totals.unreadMessages || 0))
        .catch(() => {});

    poll();
    const timer = setInterval(poll, 60_000);
    return () => clearInterval(timer);
  }, []);

  const nav = (
    <nav className="space-y-1">
      {LINKS.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-apple px-3.5 py-2.5 text-[14px] font-medium
             transition-colors duration-200
             ${isActive
               ? 'bg-accent/10 text-accent'
               : 'text-ink-muted hover:bg-black/[.04] hover:text-ink dark:text-white/55 dark:hover:bg-white/[.06] dark:hover:text-white'}`
          }
        >
          <Icon size={17} />
          {label}
          {badge === 'unread' && unread > 0 && (
            <span className="ml-auto rounded-pill bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
              {unread}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface-sunken dark:bg-night">
      {/* Top bar, phone only. */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b
        border-black/[.06] chrome-blur px-4 dark:border-white/[.08] lg:hidden">
        <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="p-2">
          <Menu size={19} />
        </button>
        <span className="text-[15px] font-semibold tracking-tight">Dashboard</span>
        <button onClick={toggle} aria-label="Toggle theme" className="p-2">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </header>

      <div className="lg:flex">
        {/* Sidebar, desktop. */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r
          border-black/[.06] bg-white px-4 py-6 dark:border-white/[.08] dark:bg-night-raised lg:flex">
          <Link to="/" className="mb-8 flex items-center gap-3 px-2">
            <Avatar name={profile.name} size={34} />
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold tracking-tight">
                {profile.firstName || profile.name}
              </span>
              <span className="block text-[11.5px] text-ink-faint">Portfolio analytics</span>
            </span>
          </Link>

          {nav}

          <div className="mt-auto space-y-1 border-t border-black/[.06] pt-4 dark:border-white/[.08]">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-apple px-3.5 py-2.5 text-[13.5px]
                text-ink-muted transition-colors hover:bg-black/[.04] hover:text-ink
                dark:text-white/55 dark:hover:bg-white/[.06] dark:hover:text-white"
            >
              <ExternalLink size={16} /> View the site
            </Link>
            <button
              onClick={toggle}
              className="flex w-full items-center gap-3 rounded-apple px-3.5 py-2.5 text-[13.5px]
                text-ink-muted transition-colors hover:bg-black/[.04] hover:text-ink
                dark:text-white/55 dark:hover:bg-white/[.06] dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-apple px-3.5 py-2.5 text-[13.5px]
                text-ink-muted transition-colors hover:bg-system-red/10 hover:text-system-red
                dark:text-white/55"
            >
              <LogOut size={16} /> Sign out
            </button>
            <p className="px-3.5 pt-2 text-[11.5px] text-ink-faint">{admin?.email}</p>
          </div>
        </aside>

        {/* Sidebar, phone. */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm lg:hidden"
            >
              <motion.aside
                onClick={(event) => event.stopPropagation()}
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 34 }}
                className="flex h-full w-72 flex-col bg-surface px-4 py-6 dark:bg-night-raised"
              >
                <div className="mb-8 flex items-center justify-between px-2">
                  <span className="text-[15px] font-semibold tracking-tight">Dashboard</span>
                  <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-1">
                    <X size={18} />
                  </button>
                </div>

                {nav}

                <div className="mt-auto space-y-1 border-t border-black/[.06] pt-4 dark:border-white/[.08]">
                  <Link
                    to="/"
                    className="flex items-center gap-3 rounded-apple px-3.5 py-2.5 text-[13.5px]
                      text-ink-muted dark:text-white/55"
                  >
                    <ExternalLink size={16} /> View the site
                  </Link>
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-apple px-3.5 py-2.5
                      text-[13.5px] text-system-red"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <Routes>
            <Route index element={<Overview />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="leads" element={<Leads />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="content" element={<Content />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
