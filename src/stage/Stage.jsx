import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Moon, Sun, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import Landing from './Landing.jsx';
import Dock from './Dock.jsx';
import Avatar from './Avatar.jsx';
import AskBar from './AskBar.jsx';

import MeView from '../views/MeView.jsx';
import RoadmapView from '../views/RoadmapView.jsx';
import WorkView from '../views/WorkView.jsx';
import SkillsView from '../views/SkillsView.jsx';
import ContactView from '../views/ContactView.jsx';

import ResumeGate from '../components/ResumeGate.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import { useProfile } from '../lib/content.jsx';
import { useTheme } from '../hooks/index.js';
import { track, trackSection } from '../lib/tracker.js';

const VIEWS = {
  me: MeView,
  roadmap: RoadmapView,
  work: WorkView,
  skills: SkillsView,
  contact: ContactView,
  // Research has no dock pill of its own; it lives at the foot of Me.
  research: MeView,
};

/**
 * The whole public site.
 *
 * One screen at a time: the landing, or a section. The avatar carries a shared
 * layout id across the two, so opening a section moves the same element into
 * the header instead of cross-fading between copies. The section is held in the
 * URL hash, which makes every view linkable and the back button work.
 */
export default function Stage() {
  const profile = useProfile();
  const { theme, toggle } = useTheme();

  const [section, setSection] = useState(null);
  const [focus, setFocus] = useState(null);
  const [resumeOpen, setResumeOpen] = useState(false);

  const scrollRef = useRef(null);

  /* -- the hash is the source of truth for which view is open --------------- */

  const readHash = useCallback(() => {
    const id = window.location.hash.replace('#', '');
    return VIEWS[id] ? id : null;
  }, []);

  useEffect(() => {
    const sync = () => {
      const next = readHash();
      setSection(next);
      if (!next) setFocus(null);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [readHash]);

  const navigate = useCallback((id, nextFocus = null) => {
    if (!VIEWS[id]) return;
    setFocus(nextFocus);
    setSection(id);
    window.history.pushState(null, '', `#${id}`);
    track('click', { label: `open:${id}`, section: id });
    trackSection(id);
    // A new view always starts at the top.
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0 }));
  }, []);

  const goHome = useCallback(() => {
    setSection(null);
    setFocus(null);
    window.history.pushState(null, '', window.location.pathname);
    track('click', { label: 'open:home', section: 'home' });
  }, []);

  // Escape closes a section, the way a sheet would.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && section) goHome();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [section, goHome]);

  const View = section ? VIEWS[section] : null;

  return (
    <>
      <a
        href="#me"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
          focus:rounded-apple focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <div className="relative min-h-[100svh]">

      {/* Theme toggle sits outside the transition so it never moves. */}
      <button
        onClick={toggle}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="fixed right-4 top-4 z-50 rounded-full p-2.5 text-ink-muted transition-colors
          hover:bg-black/[.05] hover:text-ink dark:text-white/50 dark:hover:bg-white/10
          dark:hover:text-white"
        style={{ top: 'max(16px, env(safe-area-inset-top))' }}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

        {/* Sync mode, deliberately not `mode="wait"`: the shared-layout avatar can
            only travel between the landing and the header while both are mounted,
            and waiting on an exit animation would leave the incoming view
            unmounted if animation frames were ever to stall. */}
        <AnimatePresence initial={false}>
          {!section ? (
            <Landing key="landing" onNavigate={navigate} onResume={() => setResumeOpen(true)} />
          ) : (
            <motion.div
              key="section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: [0.28, 0.11, 0.32, 1] }}
              className="absolute inset-0 flex h-[100svh] flex-col bg-surface dark:bg-night"
            >
              {/* Header: the avatar has travelled up here from the landing. */}
              <header
                className="relative z-30 flex shrink-0 items-center justify-between gap-4
                  border-b hairline chrome-blur px-4 py-3"
                style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
              >
                <button
                  onClick={goHome}
                  className="flex min-w-0 items-center gap-3 rounded-pill pr-3 text-left
                    transition-opacity hover:opacity-70"
                >
                  <Avatar size="header" />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold tracking-tight">
                      {profile.name}
                    </span>
                    <span className="block truncate text-[11.5px] text-ink-faint">
                      {profile.title}
                    </span>
                  </span>
                </button>

                {/* On a wide screen the ask bar stays available inside a section. */}
                <div className="hidden max-w-sm flex-1 justify-center lg:flex">
                  <AskBar onNavigate={navigate} compact />
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => setResumeOpen(true)}
                    className="hidden items-center gap-1.5 rounded-pill border hairline px-3.5 py-2
                      text-[12.5px] font-medium transition-colors hover:bg-black/[.04]
                      dark:hover:bg-white/[.06] sm:inline-flex"
                  >
                    <ArrowDown size={13} /> CV
                  </button>
                  <button
                    onClick={goHome}
                    aria-label="Close section"
                    className="grid h-9 w-9 place-items-center rounded-full text-ink-muted
                      transition-colors hover:bg-black/[.05] hover:text-ink dark:text-white/50
                      dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <X size={17} />
                  </button>
                </div>
              </header>

              {/* The view itself scrolls; the chrome does not. */}
              <div
                ref={scrollRef}
                className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain pt-10"
              >
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80">
                  <div className="absolute left-1/2 top-0 h-72 w-[680px] -translate-x-1/2 rounded-full
                    bg-gradient-to-br from-system-blue/12 to-transparent blur-[100px]" />
                </div>

                <motion.div
                  key={section}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05, ease: [0.28, 0.11, 0.32, 1] }}
                >
                  <View focus={focus} scrollRef={scrollRef} />
                </motion.div>
              </div>

              <Dock active={section} onSelect={navigate} floating />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ResumeGate open={resumeOpen} onClose={() => setResumeOpen(false)} />

      {/* Present on every screen — the fastest way for a client to reach her. */}
      <WhatsAppButton />

      {/* A quiet way in for the owner. */}
      {!section && (
        <Link
          to="/dashboard"
          className="fixed bottom-3 left-4 z-40 text-[11.5px] text-ink-faint transition-colors
            hover:text-ink dark:hover:text-white"
          style={{ bottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          Dashboard
        </Link>
      )}
    </>
  );
}
