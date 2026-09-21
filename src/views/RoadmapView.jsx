import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ChevronDown, MapPin, Flag } from 'lucide-react';
import { useContent } from '../lib/content.jsx';
import { LiveDot, Pill, accent } from '../components/ui/Primitives.jsx';
import { track } from '../lib/tracker.js';

/**
 * The experience roadmap.
 *
 * A single winding road is drawn down the page and fills in as you scroll, with
 * one stop per role. The road is a real SVG path whose `pathLength` is tied to
 * scroll progress, and the stops are positioned against the same geometry, so
 * the markers always sit exactly on the road however many roles there are.
 */

/** Build a serpentine path through `count` evenly spaced stops. */
function buildRoad(count, width, gap, topPad) {
  if (count === 0) return { d: '', points: [], height: topPad * 2 };

  const centre = width / 2;
  // A gentle snake near the middle. The cards sit outboard of the markers, so
  // the road needs to stay close to centre or they would cover it.
  const swing = Math.min(width * 0.07, 56);

  const points = Array.from({ length: count }, (_, index) => ({
    x: centre + (index % 2 === 0 ? -swing : swing),
    y: topPad + index * gap,
  }));

  // A smooth S through every stop, using a vertical-tangent cubic between each
  // pair so the curve always leaves and enters a stop travelling downwards.
  let d = `M ${centre} 0 L ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const from = points[i - 1];
    const to = points[i];
    const bend = (to.y - from.y) * 0.55;
    d += ` C ${from.x} ${from.y + bend}, ${to.x} ${to.y - bend}, ${to.x} ${to.y}`;
  }

  const last = points[points.length - 1];
  d += ` L ${centre} ${last.y + topPad}`;

  return { d, points, height: last.y + topPad };
}

function Stop({ item, index, position, width, open, onToggle, isFocused }) {
  const tone = accent(item.accent);
  const onLeft = index % 2 === 0;

  // Cards hang off the outside of each marker — left marker, card to its left —
  // so the road itself is never covered. On a phone they stack instead.
  const reach = (onLeft ? position.x : width - position.x) - 46;
  const cardStyle = {
    top: position.y,
    right: onLeft ? width - position.x + 30 : undefined,
    left: onLeft ? undefined : position.x + 30,
    maxWidth: Math.max(230, reach),
    width: Math.max(230, reach),
  };

  return (
    <>
      {/* Marker sitting on the road */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ top: position.y, left: position.x }}
      >
        <button
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${item.role} at ${item.company}`}
          className={`grid h-9 w-9 place-items-center rounded-full border-[3px] border-surface
            text-[12px] font-bold text-white shadow-lift transition-transform duration-300
            hover:scale-110 active:scale-95 dark:border-night ${tone.bg}
            ${isFocused ? 'ring-4 ring-accent/30' : ''}`}
        >
          {index + 1}
        </button>
        {item.current && (
          <span className="absolute -right-0.5 -top-0.5">
            <LiveDot />
          </span>
        )}
      </motion.div>

      {/* Card — absolutely placed beside the road on wide screens … */}
      <motion.div
        initial={{ opacity: 0, x: onLeft ? -28 : 28 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-12%' }}
        transition={{ duration: 0.5, ease: [0.28, 0.11, 0.32, 1] }}
        style={cardStyle}
        className="absolute z-10 hidden -translate-y-1/2 md:block"
      >
        <Card item={item} open={open} onToggle={onToggle} isFocused={isFocused} tone={tone} />
      </motion.div>
    </>
  );
}

function Card({ item, open, onToggle, isFocused, tone }) {
  return (
    <div
      className={`rounded-card border bg-surface-raised/90 p-5 backdrop-blur-sm transition-shadow
        duration-300 dark:bg-white/[.05]
        ${isFocused ? 'border-accent/40 shadow-lift' : 'hairline hover:shadow-card'}`}
    >
      <button onClick={onToggle} aria-expanded={open} className="w-full text-left">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className={`text-[12px] font-semibold uppercase tracking-[.07em] ${tone.text}`}>
            {item.company}
          </span>
          {item.current && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-system-green">
              <LiveDot /> Now
            </span>
          )}
        </div>

        <h3 className="mt-1.5 text-[17px] font-semibold leading-snug tracking-tight">{item.role}</h3>

        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[12.5px] text-ink-faint">
          <span>{item.period}</span>
          {item.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} /> {item.location}
            </span>
          )}
        </p>

        {item.summary && (
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft dark:text-white/60">
            {item.summary}
          </p>
        )}

        {(item.highlights?.length > 0 || item.stack?.length > 0) && (
          <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent">
            {open ? 'Less' : 'More'}
            <ChevronDown
              size={13}
              className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            />
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.28, 0.11, 0.32, 1] }}
            className="overflow-hidden"
          >
            {item.highlights?.length > 0 && (
              <ul className="mt-4 space-y-2 border-l-2 border-black/[.07] pl-4 dark:border-white/10">
                {item.highlights.map((highlight) => (
                  <li
                    key={highlight.slice(0, 40)}
                    className="text-[13px] leading-relaxed text-ink-soft dark:text-white/60"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            )}
            {item.stack?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.stack.map((tech) => (
                  <Pill key={tech}>{tech}</Pill>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RoadmapView({ focus, scrollRef }) {
  const { experiences } = useContent();
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(900);
  const [openIds, setOpenIds] = useState(() => new Set());

  // The road geometry depends on the container width, so it is measured rather
  // than assumed — a resize re-lays the whole thing.
  useLayoutEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;

    const measure = () => setWidth(node.clientWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const gap = 210;
  const topPad = 90;
  const road = buildRoad(experiences.length, width, gap, topPad);

  // Fill the road in as the panel scrolls.
  const { scrollYProgress } = useScroll({
    container: scrollRef,
    target: wrapRef,
    offset: ['start 0.85', 'end 0.4'],
  });
  const drawn = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });
  const glowOpacity = useTransform(drawn, [0, 0.05, 1], [0, 1, 1]);

  // Opening from the ask bar: expand and scroll to the matching role.
  useEffect(() => {
    if (focus?.type !== 'experience') return;
    const match = experiences.find(
      (item) => item.id === focus.id || item.company === focus.name,
    );
    if (!match) return;

    setOpenIds((current) => new Set(current).add(match.id));
    const timer = setTimeout(() => {
      document.getElementById(`stop-${match.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [focus, experiences]);

  const toggle = (item) => {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(item.id)) {
        next.delete(item.id);
      } else {
        next.add(item.id);
        track('click', { label: `roadmap:${item.company}`, section: 'roadmap' });
      }
      return next;
    });
  };

  const focusedId = focus?.type === 'experience' ? focus.id : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-24 md:px-8">
      <header className="mb-4 text-center">
        <p className="eyebrow">Experience</p>
        <h2 className="mt-3 text-headline gradient-text">The road so far</h2>
        <p className="mx-auto mt-4 max-w-md text-[15.5px] text-ink-muted dark:text-white/55">
          {experiences.length} stops, from a computer-vision lab in Louisville to leading voice AI
          in production. Tap any marker.
        </p>
      </header>

      <div ref={wrapRef} className="relative">
        {/* The road itself — desktop only; the phone layout is a plain list. */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
          viewBox={`0 0 ${width} ${road.height}`}
          preserveAspectRatio="none"
          style={{ height: road.height }}
        >
          <defs>
            <linearGradient id="road-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a84ff" />
              <stop offset="50%" stopColor="#5e5ce6" />
              <stop offset="100%" stopColor="#bf5af2" />
            </linearGradient>
          </defs>

          {/* Unpaved road underneath */}
          <path
            d={road.d}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-black/[.09] dark:stroke-white/[.12]"
          />
          {/* Dashes down the middle, the way a road is marked */}
          <path
            d={road.d}
            fill="none"
            strokeWidth="1.5"
            strokeDasharray="1 14"
            strokeLinecap="round"
            className="stroke-black/[.14] dark:stroke-white/[.18]"
          />
          {/* The travelled part, drawn by scroll */}
          <motion.path
            d={road.d}
            fill="none"
            stroke="url(#road-fill)"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{ pathLength: drawn, opacity: glowOpacity }}
          />
        </svg>

        {/* Start flag */}
        <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <span className="grid h-8 w-8 place-items-center rounded-full border hairline
            bg-surface text-ink-faint dark:bg-night-raised">
            <Flag size={14} />
          </span>
        </div>

        {/* Desktop: markers and cards positioned on the road */}
        <div className="relative hidden md:block" style={{ height: road.height }}>
          {experiences.map((item, index) => (
            <div key={item.id} id={`stop-${item.id}`}>
              <Stop
                item={item}
                index={index}
                position={road.points[index]}
                width={width}
                open={openIds.has(item.id)}
                onToggle={() => toggle(item)}
                isFocused={focusedId === item.id}
              />
            </div>
          ))}
        </div>

        {/* Phone: the same stops as a simple rail, which reads better at 375px */}
        <ol className="relative space-y-4 border-l-2 border-black/[.08] pl-6 pt-6 dark:border-white/[.12] md:hidden">
          {experiences.map((item, index) => {
            const tone = accent(item.accent);
            return (
              <li key={item.id} id={`stop-m-${item.id}`} className="relative">
                <span
                  className={`absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full
                    border-[3px] border-surface text-[10px] font-bold text-white dark:border-night
                    ${tone.bg}`}
                >
                  {index + 1}
                </span>
                <Card
                  item={item}
                  open={openIds.has(item.id)}
                  onToggle={() => toggle(item)}
                  isFocused={focusedId === item.id}
                  tone={tone}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
