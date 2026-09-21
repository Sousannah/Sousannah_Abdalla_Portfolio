import { TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

/* -- formatting ------------------------------------------------------------ */

export const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export function formatDuration(ms) {
  if (!ms || ms < 1000) return '0s';
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/** SQLite hands back "YYYY-MM-DD HH:MM:SS" in UTC with no zone marker. */
export function parseStamp(value) {
  if (!value) return null;
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function relativeTime(value) {
  const date = parseStamp(value);
  if (!date) return '—';

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDate(value, options) {
  const date = parseStamp(value);
  if (!date) return '—';
  return date.toLocaleString(
    undefined,
    options || { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' },
  );
}

/** Regional indicator letters render an ISO country code as its flag. */
export function flag(code) {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

/* -- building blocks ------------------------------------------------------- */

export function Panel({ title, action, className = '', children, padded = true }) {
  return (
    <section
      className={`rounded-card border border-black/[.06] bg-white dark:border-white/[.08]
        dark:bg-white/[.03] ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-black/[.06]
          px-5 py-4 dark:border-white/[.08]">
          <h2 className="text-[14px] font-semibold tracking-tight">{title}</h2>
          {action}
        </header>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, delta, icon: Icon, tone = 'text-accent', index = 0 }) {
  const up = delta != null && delta >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.28, 0.11, 0.32, 1] }}
      className="rounded-card border border-black/[.06] bg-white p-5 dark:border-white/[.08]
        dark:bg-white/[.03]"
    >
      <div className="flex items-start justify-between">
        <span className="text-[12.5px] font-medium text-ink-faint">{label}</span>
        {Icon && <Icon size={16} className={tone} />}
      </div>

      <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight">{value}</p>

      <div className="mt-2.5 flex items-center gap-2">
        {delta != null && Number.isFinite(delta) && (
          <span
            className={`inline-flex items-center gap-1 text-[12px] font-medium
              ${up ? 'text-system-green' : 'text-system-red'}`}
          >
            {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta)}%
          </span>
        )}
        {hint && <span className="text-[12px] text-ink-faint">{hint}</span>}
      </div>
    </motion.div>
  );
}

/** Horizontal bar list — the clearest way to show a top-N breakdown. */
export function BarList({ rows, labelKey = 'label', valueKey = 'sessions', renderLabel }) {
  if (!rows?.length) {
    return <p className="py-8 text-center text-[13.5px] text-ink-faint">Nothing here yet.</p>;
  }

  const max = Math.max(...rows.map((row) => row[valueKey] || 0), 1);

  return (
    <ul className="space-y-1">
      {rows.map((row) => (
        <li key={row[labelKey]} className="relative">
          <div className="relative flex items-center justify-between gap-4 rounded-lg px-3 py-2">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 rounded-lg bg-accent/[.09] dark:bg-accent/[.16]"
              style={{ width: `${((row[valueKey] || 0) / max) * 100}%` }}
            />
            <span className="relative min-w-0 truncate text-[13.5px]">
              {renderLabel ? renderLabel(row) : row[labelKey]}
            </span>
            <span className="relative shrink-0 text-[13px] font-medium tabular-nums">
              {compact.format(row[valueKey] || 0)}
              {row.share != null && (
                <span className="ml-2 text-ink-faint">{row.share}%</span>
              )}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Empty({ icon: Icon, title, body }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl
          bg-black/[.04] text-ink-faint dark:bg-white/[.06]">
          <Icon size={22} />
        </span>
      )}
      <p className="text-[15px] font-medium">{title}</p>
      {body && <p className="mt-1.5 max-w-xs text-[13.5px] text-ink-faint">{body}</p>}
    </div>
  );
}

export function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-accent
        dark:border-white/10 dark:border-t-accent" />
    </div>
  );
}

/** Segmented control for the date range, matching the site's own filter chips. */
export function RangePicker({ value, onChange }) {
  const options = [
    ['24h', '24h'],
    ['7d', '7 days'],
    ['30d', '30 days'],
    ['90d', '90 days'],
    ['all', 'All'],
  ];

  return (
    <div className="inline-flex gap-0.5 rounded-pill bg-black/[.05] p-0.5 dark:bg-white/[.07]">
      {options.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`rounded-pill px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-200
            ${value === key
              ? 'bg-white text-ink shadow-sm dark:bg-white/15 dark:text-white'
              : 'text-ink-muted hover:text-ink dark:text-white/50 dark:hover:text-white'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function Avatar({ name, email, id, size = 36 }) {
  const source = name || email || id || '?';
  const initials = name
    ? name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    : (email || id || '?').slice(0, 2).toUpperCase();

  // Same input always produces the same hue, so a visitor keeps their colour.
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) hash = source.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 48%))`,
      }}
    >
      {initials}
    </span>
  );
}

/** Shared tooltip styling for every Recharts chart in the dashboard. */
export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-black/[.08] bg-white/95 px-3 py-2 shadow-lift
      backdrop-blur-md dark:border-white/10 dark:bg-night-raised/95">
      <p className="text-[12px] font-medium text-ink-faint">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-1 flex items-center gap-2 text-[13px]">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="capitalize text-ink-muted dark:text-white/55">{entry.name}</span>
          <span className="font-semibold tabular-nums">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}
