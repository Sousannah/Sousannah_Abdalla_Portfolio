import { useCallback, useEffect, useState } from 'react';
import { Download, Search, Star, Users } from 'lucide-react';
import api from '../lib/api.js';
import { useDebounced } from '../hooks/index.js';
import VisitorDetail from './VisitorDetail.jsx';
import {
  Avatar,
  Empty,
  Panel,
  Spinner,
  flag,
  formatDuration,
  relativeTime,
} from './common.jsx';

const FILTERS = [
  ['all', 'Everyone'],
  ['identified', 'Identified'],
  ['anonymous', 'Anonymous'],
  ['returning', 'Returning'],
  ['starred', 'Starred'],
];

export default function Visitors() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const search = useDebounced(query, 350);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get(`/analytics/visitors?filter=${filter}&q=${encodeURIComponent(search)}&page=${page}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, search, page]);

  useEffect(load, [load]);

  // A new filter or search should always start from the first page.
  useEffect(() => setPage(1), [filter, search]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Visitors</h1>
          <p className="mt-1 text-[13.5px] text-ink-muted dark:text-white/50">
            {data ? `${data.total} people tracked` : 'Loading…'}
          </p>
        </div>

        <a
          href={api.url('/analytics/export?type=visitors')}
          className="inline-flex items-center gap-2 rounded-pill border border-black/10 px-4 py-2
            text-[13px] font-medium transition-colors hover:bg-black/[.04]
            dark:border-white/15 dark:hover:bg-white/[.06]"
        >
          <Download size={14} /> Export CSV
        </a>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex gap-0.5 rounded-pill bg-black/[.05] p-0.5 dark:bg-white/[.07]">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-pill px-3.5 py-1.5 text-[12.5px] font-medium transition-colors
                ${filter === key
                  ? 'bg-white text-ink shadow-sm dark:bg-white/15 dark:text-white'
                  : 'text-ink-muted hover:text-ink dark:text-white/50 dark:hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, company or city"
            className="field py-2.5 pl-10 text-[13.5px]"
          />
        </div>
      </div>

      <Panel padded={false}>
        {loading && !data ? (
          <Spinner />
        ) : !data?.rows.length ? (
          <Empty
            icon={Users}
            title="No visitors match"
            body="Once the site is live, everyone who opens it appears here."
          />
        ) : (
          <>
            {/* Table on a desktop, stacked rows on a phone. */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-black/[.06] text-[11.5px] uppercase
                    tracking-[.06em] text-ink-faint dark:border-white/[.08]">
                    <th className="px-5 py-3 font-medium">Visitor</th>
                    <th className="px-5 py-3 font-medium">Location</th>
                    <th className="px-5 py-3 font-medium">Device</th>
                    <th className="px-5 py-3 text-right font-medium">Visits</th>
                    <th className="px-5 py-3 text-right font-medium">Time</th>
                    <th className="px-5 py-3 text-right font-medium">Last seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[.05] dark:divide-white/[.06]">
                  {data.rows.map((visitor) => (
                    <tr
                      key={visitor.id}
                      onClick={() => setSelected(visitor.id)}
                      className="cursor-pointer transition-colors hover:bg-black/[.02] dark:hover:bg-white/[.03]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={visitor.name} email={visitor.email} id={visitor.id} size={34} />
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 truncate text-[14px] font-medium">
                              {visitor.name || 'Anonymous'}
                              {visitor.starred === 1 && (
                                <Star size={12} className="fill-system-yellow text-system-yellow" />
                              )}
                            </p>
                            <p className="truncate text-[12.5px] text-ink-faint">
                              {visitor.email || visitor.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px]">
                        {flag(visitor.country_code)}{' '}
                        {[visitor.city, visitor.country].filter(Boolean).join(', ') || 'Unknown'}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-ink-muted dark:text-white/55">
                        {visitor.browser || '—'} · {visitor.device || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13px] tabular-nums">
                        {visitor.session_count}
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13px] tabular-nums">
                        {formatDuration(visitor.total_time_ms)}
                      </td>
                      <td className="px-5 py-3.5 text-right text-[12.5px] text-ink-faint">
                        {relativeTime(visitor.last_seen_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.pages > 1 && (
              <div className="flex items-center justify-between gap-4 border-t border-black/[.06]
                px-5 py-3.5 dark:border-white/[.08]">
                <span className="text-[12.5px] text-ink-faint">
                  Page {data.page} of {data.pages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-pill border border-black/10 px-3.5 py-1.5 text-[12.5px]
                      font-medium disabled:opacity-40 dark:border-white/15"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="rounded-pill border border-black/10 px-3.5 py-1.5 text-[12.5px]
                      font-medium disabled:opacity-40 dark:border-white/15"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>

      <VisitorDetail visitorId={selected} onClose={() => setSelected(null)} onChange={load} />
    </div>
  );
}
