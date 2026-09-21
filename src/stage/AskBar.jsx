import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Award, Briefcase, CornerDownLeft, Layers, Search, Sparkles } from 'lucide-react';
import { useContent } from '../lib/content.jsx';
import { buildIndex, resolveQuery, suggestFor } from '../lib/router.js';
import { SUGGESTIONS } from '../data/sections.js';
import { track } from '../lib/tracker.js';

const TYPE_ICON = {
  project: Layers,
  experience: Briefcase,
  skillGroup: Sparkles,
  publication: Award,
  education: Award,
};

/**
 * Ask anything and land in the right place.
 *
 * It is a router, not a chatbot: the question is matched against the live
 * content and the section keywords, and the best destination is opened with the
 * matching card already in focus. Everything runs locally, so there is no
 * latency, no API key and nothing to go down.
 */
export default function AskBar({ onNavigate, autoFocus = false, compact = false }) {
  const content = useContent();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [missed, setMissed] = useState(false);

  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const index = useMemo(() => buildIndex(content), [content]);
  const matches = useMemo(() => suggestFor(query, index, 5), [query, index]);

  useEffect(() => {
    setHighlight(0);
    setMissed(false);
  }, [query]);

  // Close the dropdown on an outside click, the way a real combobox does.
  useEffect(() => {
    const onPointerDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const go = (destination, label) => {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    track('click', { label: `ask:${label}`, section: 'ask' });
    onNavigate(destination.sectionId, destination.focus);
  };

  const submit = (event) => {
    event?.preventDefault();
    const text = query.trim();
    if (!text) return;

    // An explicit pick from the list beats the general resolver.
    if (matches[highlight]) return go(matches[highlight], matches[highlight].label || text);

    const resolved = resolveQuery(text, index);
    if (resolved) return go(resolved, text);

    // Nothing matched: say so rather than guessing and being wrong.
    setMissed(true);
    track('click', { label: `ask:unmatched:${text.slice(0, 60)}`, section: 'ask' });
  };

  const onKeyDown = (event) => {
    if (!matches.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((current) => (current + 1) % matches.length);
      setOpen(true);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((current) => (current - 1 + matches.length) % matches.length);
      setOpen(true);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const showDropdown = open && (matches.length > 0 || missed);

  return (
    <div ref={wrapRef} className="relative w-full max-w-xl">
      <form onSubmit={submit}>
        <div
          className="flex items-center gap-2 rounded-pill border hairline bg-white/75 py-2 pl-5 pr-2
            shadow-card backdrop-blur-xl transition-shadow duration-300 focus-within:shadow-lift
            dark:bg-white/[.07]"
        >
          <Search size={17} className="shrink-0 text-ink-faint" />

          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
            autoComplete="off"
            aria-label="Ask about my work"
            aria-expanded={showDropdown}
            role="combobox"
            aria-controls="ask-results"
            placeholder="Ask me anything…"
            className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-ink outline-none
              placeholder:text-ink-faint dark:text-white dark:placeholder:text-white/40"
          />

          <button
            type="submit"
            aria-label="Go"
            disabled={!query.trim()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-white
              transition-all duration-300 hover:bg-accent-hover disabled:opacity-30
              disabled:hover:bg-accent"
          >
            <ArrowUp size={17} />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            id="ask-results"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.28, 0.11, 0.32, 1] }}
            className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-card border
              hairline bg-white/95 shadow-lift backdrop-blur-xl dark:bg-night-raised/95"
          >
            {matches.length > 0 ? (
              <ul role="listbox">
                {matches.map((match, position) => {
                  const Icon = TYPE_ICON[match.type] || Search;
                  return (
                    <li key={`${match.sectionId}-${match.label}-${position}`} role="option" aria-selected={position === highlight}>
                      <button
                        onMouseEnter={() => setHighlight(position)}
                        onClick={() => go(match, match.label)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors
                          ${position === highlight ? 'bg-black/[.04] dark:bg-white/[.07]' : ''}`}
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg
                          bg-accent/10 text-accent">
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-medium">{match.label}</span>
                          <span className="block text-[12px] capitalize text-ink-faint">
                            {match.type === 'skillGroup' ? 'skills' : match.type}
                          </span>
                        </span>
                        {position === highlight && (
                          <CornerDownLeft size={13} className="shrink-0 text-ink-faint" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-4">
                <p className="text-[13.5px] text-ink-muted dark:text-white/55">
                  I could not match that to anything on the site. Try a project name, a company,
                  or a word like <span className="font-medium">experience</span>,{' '}
                  <span className="font-medium">skills</span> or{' '}
                  <span className="font-medium">contact</span>.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Starter prompts — the fastest way to show what the bar is for. Only on
          the landing; in the header there is no room and no need. */}
      {!compact && !query && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.text}
              onClick={() => {
                track('click', { label: `suggestion:${suggestion.text}`, section: 'ask' });
                onNavigate(suggestion.section, null);
              }}
              className="rounded-pill border hairline bg-white/50 px-3.5 py-1.5 text-[12.5px]
                text-ink-muted transition-all duration-300 hover:-translate-y-0.5 hover:text-ink
                dark:bg-white/[.05] dark:text-white/55 dark:hover:text-white"
            >
              {suggestion.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
