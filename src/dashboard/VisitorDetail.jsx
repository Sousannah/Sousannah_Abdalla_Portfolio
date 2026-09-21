import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowDownToLine,
  Clock,
  ExternalLink,
  Eye,
  Globe,
  Mail,
  MessageSquare,
  MousePointerClick,
  Star,
  X,
} from 'lucide-react';
import api from '../lib/api.js';
import { Avatar, Spinner, flag, formatDate, formatDuration, relativeTime } from './common.jsx';
import { useScrollLock } from '../hooks/index.js';

const EVENT_STYLE = {
  pageview: { icon: Eye, tone: 'text-system-blue', label: 'Opened the page' },
  section_view: { icon: Activity, tone: 'text-system-indigo', label: 'Read' },
  click: { icon: MousePointerClick, tone: 'text-system-purple', label: 'Clicked' },
  project_open: { icon: ExternalLink, tone: 'text-system-teal', label: 'Opened project' },
  download: { icon: ArrowDownToLine, tone: 'text-system-green', label: 'Downloaded' },
  outbound: { icon: ExternalLink, tone: 'text-system-orange', label: 'Left for' },
  form_start: { icon: MessageSquare, tone: 'text-system-yellow', label: 'Started writing' },
  form_submit: { icon: Mail, tone: 'text-system-green', label: 'Submitted' },
  copy_email: { icon: Mail, tone: 'text-system-pink', label: 'Took your email' },
  scroll_depth: { icon: Activity, tone: 'text-ink-faint', label: 'Scrolled to' },
  exit: { icon: X, tone: 'text-ink-faint', label: 'Left the page' },
};

function describe(event) {
  const style = EVENT_STYLE[event.type] || { icon: Activity, tone: 'text-ink-faint', label: event.type };
  const detail =
    event.type === 'scroll_depth'
      ? `${event.value}%`
      : event.section || event.label || event.path || '';

  return { ...style, detail };
}

export default function VisitorDetail({ visitorId, onClose, onChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useScrollLock(Boolean(visitorId));

  useEffect(() => {
    if (!visitorId) return undefined;
    let cancelled = false;

    setLoading(true);
    api
      .get(`/analytics/visitors/${visitorId}`)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setNotes(result.visitor.notes || '');
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [visitorId]);

  const toggleStar = async () => {
    const next = data.visitor.starred ? 0 : 1;
    setData((current) => ({ ...current, visitor: { ...current.visitor, starred: next } }));
    await api.patch(`/analytics/visitors/${visitorId}`, { starred: Boolean(next) });
    onChange?.();
  };

  const saveNote = async () => {
    setSavingNote(true);
    await api.patch(`/analytics/visitors/${visitorId}`, { notes });
    setSavingNote(false);
  };

  // Heartbeats are how time is measured, not something worth reading in a list.
  const timeline = data?.events.filter((event) => event.type !== 'heartbeat') ?? [];

  return (
    <AnimatePresence>
      {visitorId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex justify-end bg-black/30 backdrop-blur-sm"
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Visitor detail"
            onClick={(event) => event.stopPropagation()}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            className="h-full w-full max-w-lg overflow-y-auto bg-surface shadow-lift dark:bg-night-raised"
          >
            {loading || !data ? (
              <Spinner />
            ) : (
              <>
                <header className="sticky top-0 z-10 flex items-start justify-between gap-4
                  border-b border-black/[.06] chrome-blur px-6 py-5 dark:border-white/[.08]">
                  <div className="flex min-w-0 items-center gap-3.5">
                    <Avatar
                      name={data.visitor.name}
                      email={data.visitor.email}
                      id={data.visitor.id}
                      size={44}
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-[17px] font-semibold tracking-tight">
                        {data.visitor.name || 'Anonymous visitor'}
                      </h2>
                      <p className="truncate text-[13px] text-ink-muted dark:text-white/50">
                        {data.visitor.email || `ID ${data.visitor.id}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={toggleStar}
                      aria-label={data.visitor.starred ? 'Unstar' : 'Star'}
                      className="rounded-full p-2 transition-colors hover:bg-black/[.05] dark:hover:bg-white/10"
                    >
                      <Star
                        size={17}
                        className={data.visitor.starred ? 'fill-system-yellow text-system-yellow' : 'text-ink-faint'}
                      />
                    </button>
                    <button
                      onClick={onClose}
                      aria-label="Close"
                      className="rounded-full p-2 text-ink-faint transition-colors hover:bg-black/[.05]
                        dark:hover:bg-white/10"
                    >
                      <X size={17} />
                    </button>
                  </div>
                </header>

                <div className="space-y-6 p-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ['Visits', data.visitor.session_count],
                      ['Views', data.visitor.pageview_count],
                      ['Time', formatDuration(data.visitor.total_time_ms)],
                      ['Actions', data.visitor.event_count],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-apple bg-black/[.03] p-3 text-center dark:bg-white/[.05]"
                      >
                        <p className="text-[18px] font-semibold tabular-nums">{value}</p>
                        <p className="text-[11.5px] text-ink-faint">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Facts */}
                  <dl className="space-y-2.5 text-[13.5px]">
                    {[
                      ['Location', `${flag(data.visitor.country_code)} ${[data.visitor.city, data.visitor.region, data.visitor.country].filter(Boolean).join(', ') || 'Unknown'}`],
                      ['Device', [data.visitor.browser, data.visitor.os, data.visitor.device].filter(Boolean).join(' · ') || '—'],
                      ['Language', data.visitor.language || '—'],
                      ['Time zone', data.visitor.timezone || '—'],
                      ['Company', data.visitor.company || '—'],
                      ['First came via', data.visitor.first_source || '—'],
                      ['Referred by', data.visitor.first_referrer || 'Direct'],
                      ['First seen', formatDate(data.visitor.first_seen_at)],
                      ['Last seen', `${formatDate(data.visitor.last_seen_at)} (${relativeTime(data.visitor.last_seen_at)})`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-4">
                        <dt className="w-32 shrink-0 text-ink-faint">{label}</dt>
                        <dd className="min-w-0 break-words">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  {/* Messages */}
                  {data.messages.length > 0 && (
                    <section>
                      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[.08em] text-ink-faint">
                        Messages
                      </h3>
                      <ul className="space-y-3">
                        {data.messages.map((message) => (
                          <li
                            key={message.id}
                            className="rounded-apple border border-black/[.06] p-4 dark:border-white/[.08]"
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="text-[14px] font-medium">{message.subject || 'No subject'}</p>
                              <span className="shrink-0 text-[12px] text-ink-faint">
                                {relativeTime(message.created_at)}
                              </span>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed
                              text-ink-soft dark:text-white/60">
                              {message.body}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* Private note */}
                  <section>
                    <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[.08em] text-ink-faint">
                      Your notes
                    </h3>
                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      onBlur={saveNote}
                      rows={3}
                      placeholder="Anything worth remembering about this person…"
                      className="field resize-none text-[13.5px]"
                    />
                    {savingNote && <p className="mt-1 text-[12px] text-ink-faint">Saving…</p>}
                  </section>

                  {/* Timeline */}
                  <section>
                    <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-[.08em] text-ink-faint">
                      Activity ({timeline.length})
                    </h3>

                    {timeline.length === 0 ? (
                      <p className="text-[13.5px] text-ink-faint">No recorded activity.</p>
                    ) : (
                      <ol className="relative space-y-4 border-l border-black/[.08] pl-5 dark:border-white/[.10]">
                        {timeline.map((event) => {
                          const { icon: Icon, tone, label, detail } = describe(event);
                          return (
                            <li key={event.id} className="relative">
                              <span
                                className={`absolute -left-[26px] flex h-[18px] w-[18px] items-center
                                  justify-center rounded-full bg-surface dark:bg-night-raised ${tone}`}
                              >
                                <Icon size={12} />
                              </span>
                              <div className="flex items-baseline justify-between gap-3">
                                <p className="text-[13.5px]">
                                  <span className="text-ink-muted dark:text-white/55">{label}</span>{' '}
                                  {detail && <span className="font-medium">{detail}</span>}
                                  {event.duration_ms > 1000 && (
                                    <span className="ml-1.5 inline-flex items-center gap-1 text-[12px] text-ink-faint">
                                      <Clock size={11} /> {formatDuration(event.duration_ms)}
                                    </span>
                                  )}
                                </p>
                                <span className="shrink-0 text-[11.5px] text-ink-faint">
                                  {relativeTime(event.created_at)}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </section>

                  {/* Sessions */}
                  <section>
                    <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[.08em] text-ink-faint">
                      Visits ({data.sessions.length})
                    </h3>
                    <ul className="space-y-2">
                      {data.sessions.map((session) => (
                        <li
                          key={session.id}
                          className="flex items-center justify-between gap-3 rounded-apple
                            bg-black/[.03] px-3.5 py-2.5 text-[13px] dark:bg-white/[.04]"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <Globe size={13} className="shrink-0 text-ink-faint" />
                            <span className="truncate">
                              {formatDate(session.started_at)} · via {session.source}
                            </span>
                          </span>
                          <span className="shrink-0 text-ink-faint">
                            {formatDuration(session.duration_ms)} · {session.max_scroll}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
