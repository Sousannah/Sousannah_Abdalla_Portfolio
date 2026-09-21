import { Children, cloneElement, isValidElement } from 'react';
import { useReveal } from '../../hooks/index.js';

/** The accent colours sections and cards pick from, kept in one place. */
export const ACCENTS = {
  blue: { text: 'text-system-blue', bg: 'bg-system-blue', soft: 'bg-system-blue/10', ring: 'ring-system-blue/20', from: 'from-system-blue' },
  indigo: { text: 'text-system-indigo', bg: 'bg-system-indigo', soft: 'bg-system-indigo/10', ring: 'ring-system-indigo/20', from: 'from-system-indigo' },
  purple: { text: 'text-system-purple', bg: 'bg-system-purple', soft: 'bg-system-purple/10', ring: 'ring-system-purple/20', from: 'from-system-purple' },
  teal: { text: 'text-system-teal', bg: 'bg-system-teal', soft: 'bg-system-teal/10', ring: 'ring-system-teal/20', from: 'from-system-teal' },
  green: { text: 'text-system-green', bg: 'bg-system-green', soft: 'bg-system-green/10', ring: 'ring-system-green/20', from: 'from-system-green' },
  orange: { text: 'text-system-orange', bg: 'bg-system-orange', soft: 'bg-system-orange/10', ring: 'ring-system-orange/20', from: 'from-system-orange' },
  pink: { text: 'text-system-pink', bg: 'bg-system-pink', soft: 'bg-system-pink/10', ring: 'ring-system-pink/20', from: 'from-system-pink' },
  red: { text: 'text-system-red', bg: 'bg-system-red', soft: 'bg-system-red/10', ring: 'ring-system-red/20', from: 'from-system-red' },
  yellow: { text: 'text-system-yellow', bg: 'bg-system-yellow', soft: 'bg-system-yellow/10', ring: 'ring-system-yellow/20', from: 'from-system-yellow' },
};

export const accent = (name) => ACCENTS[name] || ACCENTS.blue;

/** A page section that fades up the first time it is scrolled into view. */
export function Section({ id, track, className = '', children, ...rest }) {
  const [ref, visible] = useReveal({ section: track || id });

  return (
    <section
      id={id}
      ref={ref}
      className={`relative py-20 md:py-28 lg:py-36 ${className}`}
      {...rest}
    >
      <div className={`reveal ${visible ? 'reveal-in' : ''}`}>{children}</div>
    </section>
  );
}

/** Standalone reveal for anything that is not a whole section. */
export function Reveal({ delay = 0, as: Tag = 'div', className = '', children, ...rest }) {
  const [ref, visible] = useReveal();

  return (
    <Tag
      ref={ref}
      style={{ '--reveal-delay': `${delay}ms` }}
      className={`reveal ${visible ? 'reveal-in' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** The small uppercase label above a section heading. */
export function Eyebrow({ children, className = '' }) {
  return <p className={`eyebrow mb-4 ${className}`}>{children}</p>;
}

export function SectionHeading({ eyebrow, title, lede, align = 'center', className = '' }) {
  const alignment = align === 'left' ? 'text-left' : 'text-center mx-auto';

  return (
    <header className={`${alignment} max-w-2xl ${className}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-headline gradient-text">{title}</h2>
      {lede && (
        <p className="mt-5 text-lede text-ink-muted dark:text-white/60">{lede}</p>
      )}
    </header>
  );
}

/**
 * Children fade up one after another. The delay is handed to each child as a
 * CSS custom property, so the whole effect is one transition per element.
 */
export function Stagger({ children, delay = 0, step = 70, className = '' }) {
  const [ref, visible] = useReveal();

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, index) =>
        isValidElement(child)
          ? cloneElement(child, {
              'data-revealed': visible ? 'true' : 'false',
              style: { ...child.props.style, '--reveal-delay': `${delay + index * step}ms` },
            })
          : child,
      )}
    </div>
  );
}

/** One child of a Stagger. Stagger passes it the delay and the visible flag. */
export function StaggerItem({ children, className = '', style, ...rest }) {
  const revealed = rest['data-revealed'] === 'true';

  return (
    <div style={style} className={`reveal ${revealed ? 'reveal-in' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}

/** The soft rounded container used for every card on the site. */
export function Card({ as: Tag = 'div', className = '', hover = true, children, ...rest }) {
  return (
    <Tag
      className={`rounded-card border hairline bg-surface-raised/80 backdrop-blur-sm
        dark:bg-white/[.035] ${hover ? 'transition-all duration-500 ease-apple hover:shadow-lift hover:-translate-y-1' : ''}
        ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Pill({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-black/[.05] text-ink-soft dark:bg-white/[.08] dark:text-white/70',
    accent: 'bg-accent/10 text-accent dark:bg-accent/15 dark:text-accent-soft',
    green: 'bg-system-green/10 text-system-green',
  };

  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-[12.5px] font-medium
        ${tones[tone] || tones.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

/** Green dot with a pulsing halo, for "available" and "live" states. */
export function LiveDot({ className = '' }) {
  return (
    <span className={`relative inline-flex h-2 w-2 ${className}`}>
      <span className="absolute inline-flex h-full w-full rounded-full bg-system-green animate-pulse-ring" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-system-green" />
    </span>
  );
}
