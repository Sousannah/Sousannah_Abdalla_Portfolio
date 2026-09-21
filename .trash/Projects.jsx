import { forwardRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { projects } from '../data/profile.js';
import { Card, Pill, Section, SectionHeading, accent } from './ui/Primitives.jsx';
import { useScrollLock } from '../hooks/index.js';
import { track } from '../lib/tracker.js';

const CATEGORIES = ['All', ...new Set(projects.map((project) => project.category))];

// forwardRef: AnimatePresence in popLayout mode measures its children, so the
// card has to hand the DOM node back up.
const ProjectCard = forwardRef(function ProjectCard({ project, onOpen, featured }, ref) {
  const tone = accent(project.accent);

  return (
    <motion.button
      ref={ref}
      layout
      layoutId={`project-${project.name}`}
      onClick={onOpen}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45, ease: [0.28, 0.11, 0.32, 1] }}
      className={`group relative overflow-hidden rounded-card border hairline bg-surface-raised
        p-7 text-left transition-all duration-500 ease-apple hover:-translate-y-1 hover:shadow-lift
        dark:bg-white/[.035] ${featured ? 'md:col-span-2' : ''}`}
    >
      {/* Colour wash that warms up on hover. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full
          bg-gradient-to-br ${tone.from} to-transparent opacity-[.07] blur-2xl
          transition-opacity duration-700 group-hover:opacity-[.16]`}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-4">
          <span className={`text-[12px] font-semibold uppercase tracking-[.08em] ${tone.text}`}>
            {project.category}
          </span>
          <span className="text-[12.5px] text-ink-faint">{project.year}</span>
        </div>

        <h3 className="mt-4 text-[22px] font-semibold tracking-tight md:text-[26px]">
          {project.name}
        </h3>
        <p className="mt-2 text-[15.5px] leading-snug text-ink-soft dark:text-white/60">
          {project.tagline}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.stack.slice(0, featured ? 6 : 4).map((tech) => (
            <Pill key={tech}>{tech}</Pill>
          ))}
          {project.stack.length > (featured ? 6 : 4) && (
            <Pill>+{project.stack.length - (featured ? 6 : 4)}</Pill>
          )}
        </div>

        <span className="mt-6 inline-flex items-center gap-1 text-[13.5px] font-medium text-accent
          transition-transform duration-300 group-hover:translate-x-0.5">
          View details <ArrowUpRight size={15} />
        </span>
      </div>
    </motion.button>
  );
});

function ProjectSheet({ project, onClose }) {
  useScrollLock(Boolean(project));
  if (!project) return null;

  const tone = accent(project.accent);

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm
          md:items-center md:p-6"
      >
        {/* Slides up from the bottom on a phone, scales in on a desktop. */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={project.name}
          onClick={(event) => event.stopPropagation()}
          initial={{ y: '100%', opacity: 0.6, scale: 1 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 34 }}
          className="relative max-h-[92svh] w-full max-w-2xl overflow-y-auto rounded-t-panel
            bg-surface p-7 pb-10 shadow-lift dark:bg-night-raised md:rounded-panel md:p-10"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 rounded-full bg-black/[.06] p-2 text-ink-muted
              transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white/60
              dark:hover:bg-white/20"
          >
            <X size={16} />
          </button>

          {/* Grab handle, as on an iOS sheet. */}
          <div aria-hidden className="mx-auto mb-6 h-1 w-10 rounded-full bg-black/15 dark:bg-white/20 md:hidden" />

          <span className={`text-[12px] font-semibold uppercase tracking-[.08em] ${tone.text}`}>
            {project.category} · {project.year}
          </span>
          <h3 className="mt-3 text-title">{project.name}</h3>
          <p className="mt-2 text-lede text-ink-muted dark:text-white/55">{project.tagline}</p>

          <p className="mt-7 text-[16px] leading-[1.7] text-ink-soft dark:text-white/65">
            {project.description}
          </p>

          {project.outcomes?.length > 0 && (
            <div className="mt-8">
              <h4 className="text-[13px] font-semibold uppercase tracking-[.08em] text-ink-faint">
                What it delivered
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

          <div className="mt-8">
            <h4 className="text-[13px] font-semibold uppercase tracking-[.08em] text-ink-faint">
              Built with
            </h4>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <Pill key={tech}>{tech}</Pill>
              ))}
            </div>
          </div>

          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-9"
              onClick={() => track('outbound', { label: project.link, section: 'projects' })}
            >
              {project.linkLabel || 'Open'} <ArrowUpRight size={16} />
            </a>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const visible = filter === 'All' ? projects : projects.filter((p) => p.category === filter);

  const open = (project) => {
    setSelected(project);
    track('project_open', { label: project.name, section: 'projects' });
  };

  return (
    <Section id="projects" className="bg-surface-sunken dark:bg-night-sunken">
      <div className="shell">
        <SectionHeading
          align="left"
          eyebrow="Selected work"
          title="Things I have shipped"
          lede="Production systems with real users, plus the research behind them."
        />

        {/* Segmented control, the iOS pattern for switching a view. */}
        <div className="mt-10 -mx-5 overflow-x-auto px-5 no-scrollbar md:mx-0 md:px-0">
          <div className="inline-flex gap-1 rounded-pill bg-black/[.05] p-1 dark:bg-white/[.07]">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setFilter(category);
                  track('click', { label: `filter:${category}`, section: 'projects' });
                }}
                className={`relative whitespace-nowrap rounded-pill px-4 py-2 text-[13.5px] font-medium
                  transition-colors duration-300
                  ${filter === category ? 'text-ink dark:text-white' : 'text-ink-muted dark:text-white/50'}`}
              >
                {filter === category && (
                  <motion.span
                    layoutId="project-filter"
                    className="absolute inset-0 rounded-pill bg-white shadow-sm dark:bg-white/15"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{category}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="mt-10 grid gap-5 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((project) => (
              <ProjectCard
                key={project.name}
                project={project}
                featured={project.featured && filter === 'All'}
                onOpen={() => open(project)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {selected && <ProjectSheet project={selected} onClose={() => setSelected(null)} />}
    </Section>
  );
}
