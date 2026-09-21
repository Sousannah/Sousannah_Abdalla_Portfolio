import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Github, Linkedin, MapPin } from 'lucide-react';
import { useProfile } from '../lib/content.jsx';
import { LiveDot } from '../components/ui/Primitives.jsx';
import Avatar from './Avatar.jsx';
import AskBar from './AskBar.jsx';
import Dock from './Dock.jsx';
import FluidCanvas from './FluidCanvas.jsx';

/** Cycles the roles under the name, one character at a time. */
function useTypedRole(roles = []) {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    if (!roles.length) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(roles[0]);
      return undefined;
    }

    const word = roles[index % roles.length];

    if (!erasing && text === word) {
      const hold = setTimeout(() => setErasing(true), 1900);
      return () => clearTimeout(hold);
    }
    if (erasing && text === '') {
      setErasing(false);
      setIndex((i) => (i + 1) % roles.length);
      return undefined;
    }

    const timer = setTimeout(
      () => setText(erasing ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
      erasing ? 30 : 65,
    );
    return () => clearTimeout(timer);
  }, [text, erasing, index, roles]);

  return text || roles[0] || '';
}

export default function Landing({ onNavigate, onResume }) {
  const profile = useProfile();
  const role = useTypedRole(profile.roles);

  // Entrance is a CSS transition gated on `motion-ok`, so a page that never
  // gets an animation frame still shows everything. See index.css.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const rise = (delay) => ({ '--reveal-delay': `${delay}ms` });
  const shown = `reveal ${entered ? 'reveal-in' : ''}`;

  return (
    <motion.div
      key="landing"
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.28, ease: [0.28, 0.11, 0.32, 1] } }}
      className="absolute inset-0 flex min-h-[100svh] flex-col items-center justify-center overflow-y-auto px-5 py-20"
    >
      {/* The fluid follows the cursor; the static wash underneath keeps the
          page from looking empty before anything has been touched, and covers
          the devices that opt out of the simulation entirely. */}
      <FluidCanvas />

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute left-1/2 top-[6%] h-[540px] w-[860px] -translate-x-1/2 rounded-full
          bg-gradient-to-br from-system-blue/12 via-system-indigo/8 to-transparent blur-[120px]
          dark:from-system-blue/20 dark:via-system-indigo/12" />
        <div className="absolute bottom-[4%] right-[-8%] h-[420px] w-[420px] rounded-full
          bg-gradient-to-tr from-system-purple/10 to-transparent blur-[100px] animate-float" />
      </div>

      {/* The name, set oversized and low-contrast behind the content. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none truncate
          text-center font-semibold leading-none tracking-tighter text-black/[.035]
          dark:text-white/[.04]"
        style={{ fontSize: 'clamp(5rem, 19vw, 20rem)' }}
      >
        {profile.firstName || profile.name}
      </span>

      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <div style={rise(0)} className={`${shown} mb-5 flex flex-wrap items-center justify-center gap-3`}>
          {profile.available && (
            <span className="inline-flex items-center gap-2 rounded-pill border hairline bg-white/60
              px-3 py-1.5 text-[12.5px] font-medium backdrop-blur-md dark:bg-white/[.06]">
              <LiveDot />
              {profile.availabilityNote}
            </span>
          )}
          {profile.location && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted dark:text-white/50">
              <MapPin size={13} /> {profile.location}
            </span>
          )}
        </div>

        <p style={rise(80)} className={`${shown} text-[17px] font-medium text-ink-muted dark:text-white/55 md:text-[19px]`}>
          {profile.greeting || `Hey, I'm ${profile.firstName}`} <span className="inline-block animate-float">👋</span>
        </p>

        <h1
          style={rise(150)}
          className={`${shown} mt-1 flex min-h-[1.1em] items-center justify-center text-headline gradient-text`}
        >
          {role}
          <span aria-hidden className="ml-1 inline-block h-[.8em] w-[3px] animate-pulse rounded-full bg-accent" />
        </h1>

        <div style={rise(240)} className={`${shown} my-8 md:my-10`}>
          <Avatar size="hero" />
        </div>

        <div style={rise(330)} className={`${shown} flex w-full justify-center`}>
          <AskBar onNavigate={onNavigate} />
        </div>

        <div style={rise(430)} className={`${shown} mt-9`}>
          <Dock onSelect={onNavigate} />
        </div>

        <div style={rise(520)} className={`${shown} mt-7 flex items-center gap-1`}>
          <button
            onClick={onResume}
            className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12.5px]
              text-ink-muted transition-colors hover:text-ink dark:text-white/50 dark:hover:text-white"
          >
            <ArrowDown size={13} /> Download CV
          </button>
          {[
            { href: profile.linkedin, icon: Linkedin, label: 'LinkedIn' },
            { href: profile.github, icon: Github, label: 'GitHub' },
          ]
            .filter((link) => link.href)
            .map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="rounded-full p-2 text-ink-muted transition-colors hover:bg-black/[.05]
                  hover:text-ink dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Icon size={16} />
              </a>
            ))}
        </div>
      </div>
    </motion.div>
  );
}
