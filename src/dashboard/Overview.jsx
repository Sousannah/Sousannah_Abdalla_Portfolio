import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Clock,
  Eye,
  Gauge,
  Mail,
  MousePointerClick,
  Repeat,
  UserCheck,
  Users,
} from 'lucide-react';
import api from '../lib/api.js';
import {
  BarList,
  ChartTooltip,
  Panel,
  RangePicker,
  Spinner,
  StatCard,
  compact,
  flag,
  formatDuration,
  relativeTime,
} from './common.jsx';

const DEVICE_COLORS = ['#0a84ff', '#5e5ce6', '#bf5af2', '#40c8e0', '#30d158'];

/** Percentage change between two periods, guarding against division by zero. */
function delta(now, before) {
  if (before == null || before === 0) return null;
  return Math.round(((now - before) / before) * 100);
}

export default function Overview() {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [live, setLive] = useState({ active: 0, rows: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      api.get(`/analytics/overview?range=${range}`),
      api.get(`/analytics/timeseries?range=${range}`),
      api.get(`/analytics/breakdown?by=country&range=${range}`),
      api.get(`/analytics/breakdown?by=source&range=${range}`),
      api.get(`/analytics/breakdown?by=device&range=${range}`),
      api.get(`/analytics/breakdown?by=browser&range=${range}`),
      api.get(`/analytics/sections?range=${range}`),
      api.get(`/analytics/interactions?range=${range}`),
    ])
      .then(([overview, series, countries, sources, devices, browsers, sections, interactions]) => {
        if (cancelled) return;
        setData({ overview, series, countries, sources, devices, browsers, sections, interactions });
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [range]);

  // Who is on the site right now, refreshed on its own schedule.
  useEffect(() => {
    let cancelled = false;
    const poll = () =>
      api
        .get('/analytics/live')
        .then((result) => !cancelled && setLive(result))
        .catch(() => {});

    poll();
    const timer = setInterval(poll, 20_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (loading && !data) return <Spinner />;
  if (!data) return null;

  const { totals, previous } = data.overview;

  const cards = [
    {
      label: 'Visitors',
      value: compact.format(totals.visitors),
      icon: Users,
      delta: delta(totals.visitors, previous?.visitors),
      hint: 'unique people',
    },
    {
      label: 'Sessions',
      value: compact.format(totals.sessions),
      icon: MousePointerClick,
      delta: delta(totals.sessions, previous?.sessions),
      tone: 'text-system-indigo',
    },
    {
      label: 'Page views',
      value: compact.format(totals.pageviews),
      icon: Eye,
      delta: delta(totals.pageviews, previous?.pageviews),
      tone: 'text-system-purple',
    },
    {
      label: 'Avg. time on site',
      value: formatDuration(totals.avgDurationMs),
      icon: Clock,
      tone: 'text-system-teal',
      hint: `${totals.avgScroll}% avg. scroll`,
    },
    {
      label: 'Identified leads',
      value: compact.format(totals.leads),
      icon: UserCheck,
      tone: 'text-system-green',
      hint: `${totals.conversionRate}% of visitors`,
    },
    {
      label: 'Messages',
      value: compact.format(totals.messages),
      icon: Mail,
      tone: 'text-system-orange',
      hint: totals.unreadMessages ? `${totals.unreadMessages} unread` : 'all read',
    },
    {
      label: 'Returning',
      value: compact.format(totals.returningVisitors),
      icon: Repeat,
      tone: 'text-system-pink',
      hint: 'came back',
    },
    {
      label: 'Bounce rate',
      value: `${totals.bounceRate}%`,
      icon: Gauge,
      tone: 'text-system-red',
      hint: `${totals.botSessions} bot visits filtered`,
    },
  ];

  const chartData = data.series.series.map((point) => ({
    ...point,
    label: new Date(point.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 flex items-center gap-2 text-[13.5px] text-ink-muted dark:text-white/50">
            {live.active > 0 ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-system-green opacity-75" />
                  <span className="relative h-2 w-2 rounded-full bg-system-green" />
                </span>
                {live.active} {live.active === 1 ? 'person' : 'people'} on the site right now
              </>
            ) : (
              'No one on the site right now'
            )}
          </p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card, index) => (
          <StatCard key={card.label} {...card} index={index} />
        ))}
      </div>

      <Panel title="Traffic over time" padded={false}>
        <div className="h-[300px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0a84ff" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#0a84ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5e5ce6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#5e5ce6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-black/[.06] dark:text-white/[.08]" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={28} stroke="currentColor" className="text-ink-faint" />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={44} stroke="currentColor" className="text-ink-faint" allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />

              <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#0a84ff" strokeWidth={2} fill="url(#fillVisitors)" />
              <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#5e5ce6" strokeWidth={2} fill="url(#fillSessions)" />
              <Area type="monotone" dataKey="leads" name="Leads" stroke="#30d158" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Where they are">
          <BarList
            rows={data.countries.rows}
            renderLabel={(row) => (
              <span className="flex items-center gap-2">
                <span>{flag(row.label === 'Unknown' ? null : row.label.slice(0, 2))}</span>
                {row.label}
              </span>
            )}
          />
        </Panel>

        <Panel title="How they found you">
          <BarList rows={data.sources.rows} />
        </Panel>

        <Panel title="What they read" action={<span className="text-[12px] text-ink-faint">by section</span>}>
          <BarList rows={data.sections.rows} valueKey="views" />
        </Panel>

        <Panel title="Devices">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.devices.rows}
                  dataKey="sessions"
                  nameKey="label"
                  innerRadius="58%"
                  outerRadius="85%"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.devices.rows.map((row, index) => (
                    <Cell key={row.label} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Browsers">
          <BarList rows={data.browsers.rows} />
        </Panel>

        <Panel title="What they clicked">
          <BarList
            rows={data.interactions.rows.slice(0, 12)}
            valueKey="count"
            renderLabel={(row) => (
              <span className="flex items-center gap-2">
                <span className="rounded bg-black/[.05] px-1.5 py-0.5 text-[11px] text-ink-faint dark:bg-white/10">
                  {row.type}
                </span>
                <span className="truncate">{row.label}</span>
              </span>
            )}
          />
        </Panel>
      </div>

      {live.rows.length > 0 && (
        <Panel title="Live right now">
          <ul className="divide-y divide-black/[.06] dark:divide-white/[.08]">
            {live.rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-system-green opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-system-green" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">
                      {row.name || row.email || 'Anonymous visitor'}
                    </span>
                    <span className="block truncate text-[12.5px] text-ink-faint">
                      {flag(row.country_code)} {[row.city, row.country].filter(Boolean).join(', ') || 'Unknown'}
                      {' · '}{row.browser} on {row.device}{' · via '}{row.source}
                    </span>
                  </span>
                </div>
                <span className="shrink-0 text-right text-[12px] text-ink-faint">
                  <span className="block">{row.pageviews} views</span>
                  {relativeTime(row.last_activity_at)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
