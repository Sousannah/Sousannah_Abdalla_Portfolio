import { useCallback, useEffect, useState } from 'react';
import { Building2, Clock, Download, Mail, UserCheck } from 'lucide-react';
import api from '../lib/api.js';
import VisitorDetail from './VisitorDetail.jsx';
import { Avatar, Empty, Panel, Spinner, flag, formatDuration, relativeTime } from './common.jsx';

/**
 * How engaged a lead is, on a 0–100 scale. Time on site and repeat visits say
 * more than a single long session, so they carry the most weight.
 */
function score(lead) {
  const minutes = (lead.total_time_ms || 0) / 60000;
  return Math.min(
    100,
    Math.round(
      Math.min(minutes * 8, 40) +
        Math.min((lead.session_count || 0) * 12, 30) +
        Math.min((lead.pageview_count || 0) * 3, 15) +
        Math.min((lead.message_count || 0) * 15, 15),
    ),
  );
}

function ScoreRing({ value }) {
  const tone = value >= 66 ? '#30d158' : value >= 33 ? '#ff9f0a' : '#86868b';
  const circumference = 2 * Math.PI * 16;

  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center">
      <svg viewBox="0 0 40 40" className="absolute h-full w-full -rotate-90">
        <circle cx="20" cy="20" r="16" fill="none" strokeWidth="3.5" className="stroke-black/[.08] dark:stroke-white/10" />
        <circle
          cx="20" cy="20" r="16" fill="none" strokeWidth="3.5" stroke={tone} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span className="relative text-[11px] font-semibold tabular-nums">{value}</span>
    </span>
  );
}

export default function Leads() {
  const [rows, setRows] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    api
      .get('/analytics/leads')
      .then((data) => setRows(data.rows))
      .catch(() => setRows([]));
  }, []);

  useEffect(load, [load]);

  if (!rows) return <Spinner />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 text-[13.5px] text-ink-muted dark:text-white/50">
            {rows.length} {rows.length === 1 ? 'person has' : 'people have'} told you who they are
          </p>
        </div>

        <a
          href={api.url('/analytics/export?type=leads')}
          className="inline-flex items-center gap-2 rounded-pill border border-black/10 px-4 py-2
            text-[13px] font-medium transition-colors hover:bg-black/[.04]
            dark:border-white/15 dark:hover:bg-white/[.06]"
        >
          <Download size={14} /> Export CSV
        </a>
      </header>

      {rows.length === 0 ? (
        <Panel>
          <Empty
            icon={UserCheck}
            title="No leads yet"
            body="Anyone who sends a message or gives their details for the CV download shows up here, with their whole visit history attached."
          />
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((lead) => (
            <button
              key={lead.id}
              onClick={() => setSelected(lead.id)}
              className="rounded-card border border-black/[.06] bg-white p-5 text-left
                transition-all duration-300 ease-apple hover:-translate-y-0.5 hover:shadow-lift
                dark:border-white/[.08] dark:bg-white/[.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={lead.name} email={lead.email} id={lead.id} size={40} />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold tracking-tight">
                      {lead.name || 'Unnamed'}
                    </p>
                    <p className="truncate text-[12.5px] text-ink-faint">{lead.email}</p>
                  </div>
                </div>
                <ScoreRing value={score(lead)} />
              </div>

              <dl className="mt-5 space-y-2 text-[12.5px]">
                {lead.company && (
                  <div className="flex items-center gap-2 text-ink-muted dark:text-white/55">
                    <Building2 size={13} className="shrink-0" />
                    <span className="truncate">
                      {lead.company}
                      {lead.role ? ` · ${lead.role}` : ''}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-ink-muted dark:text-white/55">
                  <span>{flag(lead.country_code)}</span>
                  <span className="truncate">
                    {[lead.city, lead.country].filter(Boolean).join(', ') || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-ink-muted dark:text-white/55">
                  <Clock size={13} className="shrink-0" />
                  {lead.session_count} {lead.session_count === 1 ? 'visit' : 'visits'} ·{' '}
                  {formatDuration(lead.total_time_ms)} · {lead.pageview_count} views
                </div>
              </dl>

              <div className="mt-5 flex items-center justify-between gap-3 border-t
                border-black/[.06] pt-3.5 dark:border-white/[.08]">
                <span className="flex flex-wrap gap-1.5">
                  {(lead.intents || 'contact').split(',').map((intent) => (
                    <span
                      key={intent}
                      className="rounded-pill bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent"
                    >
                      {intent}
                    </span>
                  ))}
                  {lead.message_count > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-pill bg-system-green/10
                      px-2 py-0.5 text-[11px] font-medium text-system-green">
                      <Mail size={10} /> {lead.message_count}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-[11.5px] text-ink-faint">
                  {relativeTime(lead.identified_at)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <VisitorDetail visitorId={selected} onClose={() => setSelected(null)} onChange={load} />
    </div>
  );
}
