import { useCallback, useEffect, useState } from 'react';
import { Archive, ArchiveRestore, Inbox as InboxIcon, Mail, Reply, Trash2, TriangleAlert } from 'lucide-react';
import api from '../lib/api.js';
import { Avatar, Empty, Panel, Spinner, flag, formatDate, relativeTime } from './common.jsx';

export default function Inbox() {
  const [rows, setRows] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => {
    api
      .get(`/analytics/messages?archived=${showArchived ? 1 : 0}`)
      .then((data) => setRows(data.rows))
      .catch(() => setRows([]));
  }, [showArchived]);

  useEffect(load, [load]);

  const open = async (message) => {
    const next = openId === message.id ? null : message.id;
    setOpenId(next);

    if (next && !message.read_at) {
      await api.patch(`/analytics/messages/${message.id}`, { read: true });
      setRows((current) =>
        current.map((row) =>
          row.id === message.id ? { ...row, read_at: new Date().toISOString() } : row,
        ),
      );
    }
  };

  const archive = async (message, archived) => {
    await api.patch(`/analytics/messages/${message.id}`, { archived });
    load();
  };

  const remove = async (message) => {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
    await api.delete(`/analytics/messages/${message.id}`);
    load();
  };

  if (!rows) return <Spinner />;

  const unread = rows.filter((row) => !row.read_at).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Inbox</h1>
          <p className="mt-1 text-[13.5px] text-ink-muted dark:text-white/50">
            {rows.length} {rows.length === 1 ? 'message' : 'messages'}
            {unread > 0 && ` · ${unread} unread`}
          </p>
        </div>

        <button
          onClick={() => setShowArchived((v) => !v)}
          className="inline-flex items-center gap-2 rounded-pill border border-black/10 px-4 py-2
            text-[13px] font-medium transition-colors hover:bg-black/[.04]
            dark:border-white/15 dark:hover:bg-white/[.06]"
        >
          {showArchived ? <InboxIcon size={14} /> : <Archive size={14} />}
          {showArchived ? 'Back to inbox' : 'Archived'}
        </button>
      </header>

      <Panel padded={false}>
        {rows.length === 0 ? (
          <Empty
            icon={Mail}
            title={showArchived ? 'Nothing archived' : 'No messages yet'}
            body={showArchived ? undefined : 'Anything sent through the contact form lands here and in your email.'}
          />
        ) : (
          <ul className="divide-y divide-black/[.05] dark:divide-white/[.06]">
            {rows.map((message) => {
              const isOpen = openId === message.id;

              return (
                <li key={message.id}>
                  <button
                    onClick={() => open(message)}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors
                      hover:bg-black/[.02] dark:hover:bg-white/[.03]"
                  >
                    <Avatar name={message.name} email={message.email} size={38} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="flex items-center gap-2 truncate text-[14.5px]">
                          {!message.read_at && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                          )}
                          <span className={message.read_at ? 'font-medium' : 'font-semibold'}>
                            {message.name}
                          </span>
                          {message.company && (
                            <span className="truncate text-[13px] text-ink-faint">
                              · {message.company}
                            </span>
                          )}
                        </p>
                        <span className="shrink-0 text-[12px] text-ink-faint">
                          {relativeTime(message.created_at)}
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-[13.5px] text-ink-muted dark:text-white/55">
                        {message.subject || 'No subject'}
                      </p>

                      {!isOpen && (
                        <p className="mt-1 truncate text-[13px] text-ink-faint">{message.body}</p>
                      )}

                      {isOpen && (
                        <div className="mt-4">
                          <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed
                            text-ink-soft dark:text-white/65">
                            {message.body}
                          </p>

                          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-1.5 text-[12.5px] text-ink-faint">
                            <span>{message.email}</span>
                            <span>
                              {flag()} {[message.city, message.country].filter(Boolean).join(', ') || 'Unknown'}
                            </span>
                            <span>{formatDate(message.created_at, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            {message.session_count && (
                              <span>{message.session_count} visits · {message.pageview_count} views</span>
                            )}
                          </dl>

                          {message.mail_status === 'failed' && (
                            <p className="mt-4 flex items-start gap-2 rounded-apple bg-system-orange/[.10]
                              p-3 text-[12.5px] text-system-orange">
                              <TriangleAlert size={14} className="mt-px shrink-0" />
                              Saved here, but the email forward failed ({message.mail_error || 'unknown error'}).
                              Check the SMTP settings in the backend .env.
                            </p>
                          )}

                          <div className="mt-5 flex flex-wrap gap-2">
                            <a
                              href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || 'your message'}`)}`}
                              onClick={(event) => event.stopPropagation()}
                              className="inline-flex items-center gap-2 rounded-pill bg-accent px-4 py-2
                                text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
                            >
                              <Reply size={14} /> Reply
                            </a>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                archive(message, !message.archived);
                              }}
                              className="inline-flex items-center gap-2 rounded-pill border
                                border-black/10 px-4 py-2 text-[13px] font-medium transition-colors
                                hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
                            >
                              {message.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                              {message.archived ? 'Unarchive' : 'Archive'}
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                remove(message);
                              }}
                              className="inline-flex items-center gap-2 rounded-pill px-4 py-2
                                text-[13px] font-medium text-system-red transition-colors
                                hover:bg-system-red/10"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
