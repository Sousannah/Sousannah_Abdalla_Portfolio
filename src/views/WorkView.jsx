import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { useContent } from '../lib/content.jsx';
import { Pill, accent } from '../components/ui/Primitives.jsx';
import { useScrollLock } from '../hooks/index.js';
import { track } from '../lib/tracker.js';
import { mediaUrl } from '../lib/api.js';

/**
 * Categories read like "Applied AI · Automation" or "Concept · Voice AI". The
 * filter wants one word for the subject, and for a concept that is the part
 * after the marker — otherwise all six would collapse into "Concept", which the
 * kind filter already covers.
 */
function topicOf(category = '') {
  const parts = category.split('·').map((part) => part.trim()).filter(Boolean);
  return (parts[0] === 'Concept' ? parts[1] : parts[0]) || 'Other';
}

const KINDS = [
  { id: 'all', label: 'Everything' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'concept', label: 'Can build for you' },
];

/** A small marker so a concept is never mistaken for delivered work. */
function ConceptTag({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill bg-white/15 px-2 py-[3px]
        text-[10.5px] font-semibold uppercase tracking-[.06em] text-white backdrop-blur-md ${className}`}
    >
      <Sparkles size={10} /> Can build
    </span>
  );
}

/** A tall card with the cover art bleeding to the edges, like an App Store tile. */
function ProjectCard({ project, onOpen, isFocused }) {
  const tone = accent(project.accent);

  return (
    <motion.button
      layoutId={`project-${project.id}`}
      onClick={onOpen}
      className={`group relative h-[420px] w-[280px] shrink-0 snap-center overflow-hidden
        rounded-panel text-left shadow-card transition-shadow duration-500 hover:shadow-lift
        sm:w-[320px] ${isFocused ? 'ring-2 ring-accent ring-offset-4 ring-offset-surface dark:ring-offset-night' : ''}`}
    >
      {project.coverUrl ? (
        <>
          <img
            src={mediaUrl(project.coverUrl)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform
              duration-700 ease-apple group-hover:scale-105"
            loading="lazy"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        </>
      ) : (
        // No image yet: a generated gradient keeps the grid looking deliberate
        // rather than broken. Upload a cover in the dashboard to replace it.
        <>
          <span className={`absolute inset-0 bg-gradient-to-br ${tone.from} to-black`} />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <span
            aria-hidden
            className="absolute -right-10 -top-10 select-none text-[11rem] font-bold leading-none
              text-white/[.07]"
          >
            {project.name.charAt(0)}
          </span>
        </>
      )}

      {project.kind === 'concept' && <ConceptTag className="absolute left-5 top-5" />}

      <div className="relative flex h-full flex-col justify-end p-6 text-white">
        <span className="text-[11.5px] font-semibold uppercase tracking-[.09em] text-white/70">
          {project.category}
        </span>
        <h3 className="mt-1.5 text-[26px] font-semibold leading-[1.1] tracking-tight">
          {project.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-[14px] leading-snug text-white/75">
          {project.tagline}
        </p>

        <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium
          transition-transform duration-300 group-hover:translate-x-0.5">
          View <ArrowUpRight size={14} />
        </span>
      </div>
    </motion.button>
  );
}

function ProjectSheet({ project, onClose }) {
  useScrollLock(Boolean(project));
  if (!project) return null;

  const tone = accent(project.accent);
  const isConcept = project.kind === 'concept';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 backdrop-blur-sm
        md:items-center md:p-6"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        onClick={(event) => event.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 34 }}
        className="relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-panel
          bg-surface pb-10 shadow-lift dark:bg-night-raised md:rounded-panel"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full
            bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
        >
          <X size={16} />
        </button>

        {project.coverUrl && (
          <img src={mediaUrl(project.coverUrl)} alt="" className="h-52 w-full object-cover md:h-64" />
        )}

        <div className="p-7 md:p-9">
          <div aria-hidden className="mx-auto mb-6 h-1 w-10 rounded-full bg-black/15 dark:bg-white/20 md:hidden" />

          <span className={`text-[12px] font-semibold uppercase tracking-[.08em] ${tone.text}`}>
            {project.category} · {project.year}
          </span>
          <h3 className="mt-3 text-title">{project.name}</h3>
          <p className="mt-2 text-lede text-ink-muted dark:text-white/55">{project.tagline}</p>

          {isConcept && (
            // Said plainly and above the fold: this one has not been built yet.
            <div className="mt-6 flex gap-3 rounded-apple border border-accent/25 bg-accent/[.06] p-4">
              <Sparkles size={17} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-[14px] leading-relaxed text-ink-soft dark:text-white/65">
                This is something I can build for you, not something I have already delivered.
                The screens are a design of the finished system — the engineering behind it comes
                from the shipped work above.
              </p>
            </div>
          )}

          {project.description && (
            <p className="mt-7 text-[16px] leading-[1.7] text-ink-soft dark:text-white/65">
              {project.description}
            </p>
          )}

          {project.gallery?.length > 0 && (
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {project.gallery.map((src) => (
                <img
                  key={src}
                  src={mediaUrl(src)}
                  alt=""
                  loading="lazy"
                  className="w-full rounded-apple border hairline object-cover"
                />
              ))}
            </div>
          )}

          {project.outcomes?.length > 0 && (
            <div className="mt-8">
              <h4 className="text-[13px] font-semibold uppercase tracking-[.08em] text-ink-faint">
                {isConcept ? 'What it would do' : 'What it delivered'}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {project.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-3 text-[15px] text-ink-soft dark:text-white/65">
                    <Check size={17} className={`mt-0.5 shrink-0 ${tone.text}`} />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.stack?.length > 0 && (
            <div className="mt-8">
              <h4 className="text-[13px] font-semibold uppercase tracking-[.08em] text-ink-faint">
                {isConcept ? 'Built with' : 'Built with'}
              </h4>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <Pill key={tech}>{tech}</Pill>
                ))}
              </div>
            </div>
          )}

          {isConcept ? (
            <a
              href="#contact"
              onClick={() => track('concept_enquiry', { label: project.name, section: 'work' })}
              className="btn-primary mt-9"
            >
              Talk to me about this <ArrowUpRight size={16} />
            </a>
          ) : project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              onClick={() => track('outbound', { label: project.link, section: 'work' })}
              className="btn-primary mt-9"
            >
              {project.linkLabel || 'Open'} <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** One quieter tile, used for everything outside the featured rail. */
function ProjectTile({ project, onOpen, isFocused }) {
  const tone = accent(project.accent);

  return (
    <button
      id={`work-${project.id}`}
      onClick={onOpen}
      className={`group rounded-card border bg-surface-raised p-6 text-left
        transition-all duration-500 ease-apple hover:-translate-y-1 hover:shadow-lift
        dark:bg-white/[.035]
        ${isFocused ? 'border-accent/50' : 'hairline'}`}
    >
      <div className="flex items-center gap-2">
        <span className={`text-[11.5px] font-semibold uppercase tracking-[.08em] ${tone.text}`}>
          {project.category}
        </span>
        {project.kind === 'concept' && (
          <span className="rounded-pill bg-accent/10 px-2 py-[2px] text-[10px] font-semibold
            uppercase tracking-[.06em] text-accent">
            Can build
          </span>
        )}
      </div>
      <h4 className="mt-2 text-[18px] font-semibold tracking-tight">{project.name}</h4>
      <p className="mt-1.5 line-clamp-2 text-[13.5px] text-ink-muted dark:text-white/55">
        {project.tagline}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.stack?.slice(0, 3).map((tech) => (
          <Pill key={tech}>{tech}</Pill>
        ))}
      </div>
    </button>
  );
}

export default function WorkView({ focus }) {
  const { projects } = useContent();
  const [selected, setSelected] = useState(null);
  const [kind, setKind] = useState('all');
  const [topic, setTopic] = useState('all');
  const railRef = useRef(null);

  // Topics, commonest first, so the pills that matter are reachable without
  // scrolling the row on a phone.
  const topics = useMemo(() => {
    const counts = new Map();
    projects.forEach((project) => {
      const name = topicOf(project.category);
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [projects]);

  const matches = useMemo(
    () => projects.filter((project) => {
      const projectKind = project.kind || 'shipped';
      if (kind !== 'all' && projectKind !== kind) return false;
      if (topic !== 'all' && topicOf(project.category) !== topic) return false;
      return true;
    }),
    [projects, kind, topic],
  );

  const filtering = kind !== 'all' || topic !== 'all';
  const featured = matches.filter((project) => project.featured);
  const rest = matches.filter((project) => !project.featured);

  const focusedId =
    focus?.type === 'project'
      ? projects.find((p) => p.id === focus.id || p.name === focus.name)?.id
      : null;

  // Arriving from the ask bar: clear any filter that would hide the match,
  // bring the card into view, then open it.
  useEffect(() => {
    if (!focusedId) return undefined;
    setKind('all');
    setTopic('all');
    const timer = setTimeout(() => {
      const card = document.getElementById(`work-${focusedId}`);
      card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      setSelected(projects.find((p) => p.id === focusedId) || null);
    }, 400);
    return () => clearTimeout(timer);
  }, [focusedId, projects]);

  const scrollRail = (direction) => {
    railRef.current?.scrollBy({ left: direction * 340, behavior: 'smooth' });
  };

  const open = (project) => {
    setSelected(project);
    track('project_open', { label: project.name, section: 'work' });
  };

  const choose = (setter, value, kindOfFilter) => {
    setter(value);
    track('work_filter', { label: `${kindOfFilter}:${value}`, section: 'work' });
  };

  const chip = (active) =>
    `rounded-pill px-3.5 py-1.5 text-[13px] font-medium transition-all duration-300 ease-apple ${
      active
        ? 'bg-ink text-surface shadow-card dark:bg-white dark:text-night'
        : 'border hairline text-ink-muted hover:text-ink dark:text-white/55 dark:hover:text-white'
    }`;

  return (
    <div className="w-full pb-24">
      <header className="mx-auto mb-7 max-w-5xl px-5 text-center md:px-8">
        <p className="eyebrow">Selected work</p>
        <h2 className="mt-3 text-headline gradient-text">Things I have shipped</h2>
        <p className="mx-auto mt-4 max-w-md text-[15.5px] text-ink-muted dark:text-white/55">
          Production systems with real users, plus the research behind them — and a few things
          I would happily build next.
        </p>
      </header>

      {/* Filters */}
      <div className="mx-auto mb-8 max-w-5xl px-5 md:px-8">
        <div className="flex flex-wrap justify-center gap-2">
          {KINDS.map(({ id, label }) => (
            <button key={id} onClick={() => choose(setKind, id, 'kind')} className={chip(kind === id)}>
              {label}
            </button>
          ))}
        </div>

        <div className="no-scrollbar mt-3 flex justify-start gap-2 overflow-x-auto pb-1
          md:flex-wrap md:justify-center md:overflow-visible">
          <button onClick={() => choose(setTopic, 'all', 'topic')} className={`shrink-0 ${chip(topic === 'all')}`}>
            All topics
          </button>
          {topics.map(([name, count]) => (
            <button
              key={name}
              onClick={() => choose(setTopic, name, 'topic')}
              className={`shrink-0 ${chip(topic === name)}`}
            >
              {name} <span className="opacity-50">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {matches.length === 0 && (
        <p className="py-16 text-center text-[15px] text-ink-muted dark:text-white/55">
          Nothing matches that combination.{' '}
          <button
            onClick={() => { setKind('all'); setTopic('all'); }}
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            Clear the filters
          </button>
        </p>
      )}

      {/* Unfiltered: the featured rail leads, everything else follows as a grid.
          Filtered: one grid, because a two-item rail looks like a mistake. */}
      {!filtering && featured.length > 0 && (
        <div className="relative">
          <div
            ref={railRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-5
              pb-4 md:px-[max(2rem,calc(50vw-32rem))]"
          >
            {featured.map((project) => (
              <div key={project.id} id={`work-${project.id}`} className="snap-center">
                <ProjectCard
                  project={project}
                  onOpen={() => open(project)}
                  isFocused={focusedId === project.id}
                />
              </div>
            ))}
          </div>

          {/* Rail arrows, desktop only — a phone just swipes. */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center
            justify-between px-4 lg:flex">
            {[-1, 1].map((direction) => (
              <button
                key={direction}
                onClick={() => scrollRail(direction)}
                aria-label={direction < 0 ? 'Previous projects' : 'Next projects'}
                className="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border
                  hairline chrome-blur text-ink-muted shadow-card transition-all duration-300
                  hover:scale-110 hover:text-ink dark:text-white/60 dark:hover:text-white"
              >
                {direction < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {(filtering ? matches : rest).length > 0 && (
        <div className="mx-auto mt-14 max-w-5xl px-5 md:px-8">
          <h3 className="mb-5 text-[13px] font-semibold uppercase tracking-[.08em] text-ink-faint">
            {filtering
              ? `${matches.length} ${matches.length === 1 ? 'project' : 'projects'}`
              : 'More work'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(filtering ? matches : rest).map((project) => (
              <ProjectTile
                key={project.id}
                project={project}
                onOpen={() => open(project)}
                isFocused={focusedId === project.id}
              />
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selected && <ProjectSheet project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
