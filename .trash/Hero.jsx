import { useEffect, useState } from 'react';
import { ArrowDown, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { person } from '../data/profile.js';
import { LiveDot } from './ui/Primitives.jsx';
import { track } from '../lib/tracker.js';

/** Cycles the job titles under the name, one character at a time. */
function useTypedRole(roles, { typeMs = 65, eraseMs = 30, holdMs = 1900 } = {}) {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(roles[0]);
      return undefined;
    }

    const word = roles[index % roles.length];

    if (!erasing && text === word) {
      const hold = setTimeout(() => setErasing(true), holdMs);
      return () => clearTimeout(hold);
    }

    if (erasing && text === '') {
      setErasing(false);
      setIndex((i) => (i + 1) % roles.length);
      return undefined;
    }

    const timer = setTimeout(
      () => setText(erasing ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
      erasing ? eraseMs : typeMs,
    );
    return () => clearTimeout(timer);
  }, [text, erasing, index, roles, typeMs, eraseMs, holdMs]);

  return text;
}

export default function Hero({ onResume }) {
  const role = useTypedRole(person.roles);

  // The hero is the one thing that must never be left invisible, so its
  // entrance is a CSS transition applied on mount rather than a JS animation.
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(timer);
  }, []);

  // Each element gets the same transition, only staggered by its delay.
  const rise = (delay) => ({ '--reveal-delay': `${delay}ms` });
  const revealed = `reveal ${entered ? 'reveal-in' : ''}`;

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-12"
    >
      {/* Wide, soft colour wash — the backdrop Apple uses on product pages. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[600px] w-[900px] -translate-x-1/2 rounded-full
          bg-gradient-to-br from-system-blue/20 via-system-indigo/10 to-transparent blur-[110px]
          dark:from-system-blue/25 dark:via-system-indigo/15" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[480px] w-[480px] rounded-full
          bg-gradient-to-tr from-system-purple/15 to-transparent blur-[100px] animate-float" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent
          to-surface dark:to-night" />
      </div>

      <div className="shell">
        <div className="max-w-4xl">
          <div style={rise(0)} className={`${revealed} mb-7 flex flex-wrap items-center gap-3`}>
            {person.available && (
              <span className="inline-flex items-center gap-2 rounded-pill border hairline
                bg-white/60 px-3 py-1.5 text-[12.5px] font-medium backdrop-blur-md dark:bg-white/[.06]">
                <LiveDot />
                {person.availabilityNote}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-muted dark:text-white/50">
              <MapPin size={13} /> {person.location}
            </span>
          </div>

          <h1 style={rise(80)} className={`${revealed} text-display gradient-text`}>
            {person.name}
          </h1>

          <div
            style={rise(160)}
            className={`${revealed} mt-4 flex h-9 items-center
              text-[clamp(1.1rem,2.4vw,1.75rem)] font-medium tracking-tight
              text-ink-muted dark:text-white/55`}
          >
            <span>{role}</span>
            <span className="ml-0.5 inline-block h-[1.15em] w-[2px] animate-pulse bg-accent" />
          </div>

          <p
            style={rise(240)}
            className={`${revealed} mt-7 max-w-2xl text-lede text-ink-soft dark:text-white/65`}
          >
            {person.intro}
          </p>

          <div
            style={rise(320)}
            className={`${revealed} mt-10 flex flex-wrap items-center gap-3`}
          >
            <button
              onClick={() => {
                track('click', { label: 'hero:contact', section: 'hero' });
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary"
            >
              <Mail size={16} /> Start a conversation
            </button>

            <button onClick={onResume} className="btn-secondary">
              <ArrowDown size={16} /> Download CV
            </button>

            <div className="ml-1 flex items-center gap-1">
              {[
                { href: person.linkedin, icon: Linkedin, label: 'LinkedIn' },
                { href: person.github, icon: Github, label: 'GitHub' },
                { href: `mailto:${person.email}`, icon: Mail, label: 'Email' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel="noreferrer"
                  aria-label={label}
                  className="rounded-full p-2.5 text-ink-muted transition-all duration-300
                    hover:bg-black/[.05] hover:text-ink dark:text-white/50
                    dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <dl
            style={rise(440)}
            className={`${revealed} mt-16 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4`}
          >
            {person.stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[28px] font-semibold tracking-tight md:text-[34px]">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-[13px] leading-snug text-ink-muted dark:text-white/50">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div
        aria-hidden
        style={rise(1200)}
        className={`${revealed} absolute inset-x-0 bottom-8 flex justify-center`}
      >
        <div className="animate-float text-ink-faint dark:text-white/30">
          <ArrowDown size={18} />
        </div>
      </div>
    </section>
  );
}
