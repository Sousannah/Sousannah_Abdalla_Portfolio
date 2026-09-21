import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReveal } from '../hooks/index.js';
import { ChevronDown, MapPin } from 'lucide-react';
import { experience } from '../data/profile.js';
import { LiveDot, Pill, Section, SectionHeading, accent } from './ui/Primitives.jsx';
import { track } from '../lib/tracker.js';

function Entry({ item, index, open, onToggle }) {
  const tone = accent(item.accent);
  const [ref, visible] = useReveal();

  return (
    <li
      ref={ref}
      style={{ '--reveal-delay': `${Math.min(index * 50, 300)}ms` }}
      className={`reveal ${visible ? 'reveal-in' : ''} relative pl-8 md:pl-10`}
    >
      {/* Rail and node */}
      <span
        aria-hidden
        className="absolute left-[5px] top-3 h-full w-px bg-gradient-to-b from-black/10 to-transparent
          dark:from-white/15"
      />
      <span
        aria-hidden
        className={`absolute left-0 top-2 h-[11px] w-[11px] rounded-full ring-4 ring-surface-sunken
          dark:ring-night ${item.current ? tone.bg : 'bg-black/20 dark:bg-white/25'}`}
      />

      <div className="pb-10">
        <button
          onClick={onToggle}
          aria-expanded={open}
          className="group w-full text-left"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="text-[19px] font-semibold tracking-tight md:text-[21px]">
              {item.role}
            </h3>
            {item.current && (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-system-green">
                <LiveDot /> Current
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px]">
            <span className={`font-medium ${tone.text}`}>{item.company}</span>
            <span className="text-ink-faint">·</span>
            <span className="text-ink-muted dark:text-white/50">{item.period}</span>
            <span className="inline-flex items-center gap-1 text-ink-faint">
              <MapPin size={12} /> {item.location}
            </span>
          </div>

          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft dark:text-white/60">
            {item.summary}
          </p>

          <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">
            {open ? 'Show less' : 'Show details'}
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ease-apple ${open ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.28, 0.11, 0.32, 1] }}
              className="overflow-hidden"
            >
              <ul className="mt-5 space-y-3 border-l-2 border-black/[.07] pl-5 dark:border-white/10">
                {item.highlights.map((highlight) => (
                  <li
                    key={highlight.slice(0, 40)}
                    className="text-[14.5px] leading-relaxed text-ink-soft dark:text-white/60"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                {item.stack.map((tech) => (
                  <Pill key={tech}>{tech}</Pill>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}

export default function Experience() {
  // The two current roles start expanded; everything else is opt-in.
  const [openSet, setOpenSet] = useState(() => new Set([0, 1]));

  const toggle = (index, company) => {
    setOpenSet((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
        track('click', { label: `experience:${company}`, section: 'experience' });
      }
      return next;
    });
  };

  return (
    <Section id="experience">
      <div className="shell">
        <SectionHeading
          align="left"
          eyebrow="Experience"
          title="Where I have been building"
          lede="Production AI systems, a platform of my own, and research that made it to IEEE."
        />

        <ol className="mt-14">
          {experience.map((item, index) => (
            <Entry
              key={`${item.company}-${item.role}`}
              item={item}
              index={index}
              open={openSet.has(index)}
              onToggle={() => toggle(index, item.company)}
            />
          ))}
        </ol>
      </div>
    </Section>
  );
}
