/**
 * Visitor tracking.
 *
 * Events are queued in memory and flushed in batches, so a visitor who reads
 * the whole page causes a handful of requests rather than one per interaction.
 * Nothing here can learn who someone is — that only happens when they type
 * their details into the contact form or the resume gate, at which point
 * `identify()` links the name and email to everything already recorded.
 */
import { BASE } from './api.js';

const STORAGE_VISITOR = 'pf_visitor_id';
const STORAGE_SESSION = 'pf_session_id';
const FLUSH_INTERVAL_MS = 8000;
const MAX_BATCH = 25;

const state = {
  visitorId: null,
  sessionId: null,
  queue: [],
  timer: null,
  started: Date.now(),
  lastBeat: Date.now(),
  maxScroll: 0,
  seenSections: new Set(),
  enabled: true,
  sending: false,
};

/* -- storage helpers: private mode and blocked cookies must not throw ------- */

function read(key, store) {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value, store) {
  try {
    store.setItem(key, value);
  } catch {
    /* Storage unavailable — the server still issues ids per request. */
  }
}

/* -- context gathered once per page load ----------------------------------- */

function clientContext() {
  const params = new URLSearchParams(window.location.search);
  return {
    path: window.location.pathname + window.location.search,
    referrer: document.referrer || null,
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
    language: navigator.language || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    screenW: window.screen?.width ?? null,
    screenH: window.screen?.height ?? null,
  };
}

/* -- network --------------------------------------------------------------- */

// Shared with api.js rather than read from the environment again. When these
// were two separate constants, a build without VITE_API_URL sent every event to
// the site's own domain instead of the API — silently, because the beacon's
// response is never checked. Analytics simply stayed empty.

async function send(events, { beacon = false } = {}) {
  const payload = JSON.stringify({
    visitorId: state.visitorId,
    sessionId: state.sessionId,
    client: clientContext(),
    events,
  });

  // On unload only sendBeacon is guaranteed to survive the page going away.
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon(`${BASE}/api/track`, new Blob([payload], { type: 'application/json' }));
    return;
  }

  try {
    const response = await fetch(`${BASE}/api/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      credentials: 'include',
      keepalive: true,
    });
    if (!response.ok) return;

    const data = await response.json();
    if (data.visitorId) {
      state.visitorId = data.visitorId;
      write(STORAGE_VISITOR, data.visitorId, window.localStorage);
    }
    if (data.sessionId) {
      state.sessionId = data.sessionId;
      write(STORAGE_SESSION, data.sessionId, window.sessionStorage);
    }
  } catch {
    /* Offline or blocked. Tracking is never allowed to break the page. */
  }
}

async function flush({ beacon = false } = {}) {
  if (!state.enabled || state.sending) return;
  if (!state.queue.length) return;

  const batch = state.queue.splice(0, MAX_BATCH);
  state.sending = true;
  try {
    await send(batch, { beacon });
  } finally {
    state.sending = false;
  }
}

/* -- public API ------------------------------------------------------------ */

export function track(type, details = {}) {
  if (!state.enabled) return;

  state.queue.push({ type, path: window.location.pathname, ...details });

  // Flush immediately for the events worth knowing about in real time.
  if (['form_submit', 'download', 'outbound', 'exit'].includes(type)) {
    flush();
  } else if (state.queue.length >= MAX_BATCH) {
    flush();
  }
}

/** Record a section coming into view, once per visit. */
export function trackSection(section) {
  if (state.seenSections.has(section)) return;
  state.seenSections.add(section);
  track('section_view', { section });
}

/**
 * Attach a name and email to this visitor. Called by the contact form and the
 * resume gate — never automatically.
 */
export async function identify(details) {
  try {
    const response = await fetch(`${BASE}/api/track/identify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId: state.visitorId,
        sessionId: state.sessionId,
        ...details,
      }),
      credentials: 'include',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function getIds() {
  return { visitorId: state.visitorId, sessionId: state.sessionId };
}

/**
 * Turn tracking off for the rest of the visit and drop anything queued.
 *
 * Nothing in the UI calls this — it is kept as the hook a privacy page or a
 * footer link would use, and `initTracker` still honours the flag it sets.
 */
export function optOut() {
  state.enabled = false;
  state.queue = [];
  write('pf_opt_out', '1', window.localStorage);
}

export function hasOptedOut() {
  return read('pf_opt_out', window.localStorage) === '1';
}

/* -- boot ------------------------------------------------------------------ */

let booted = false;

export function initTracker() {
  if (booted || typeof window === 'undefined') return;
  booted = true;

  // Honour Do Not Track and any earlier opt-out.
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || hasOptedOut()) {
    state.enabled = false;
    return;
  }

  state.visitorId = read(STORAGE_VISITOR, window.localStorage);
  state.sessionId = read(STORAGE_SESSION, window.sessionStorage);

  track('pageview');
  flush();

  state.timer = window.setInterval(flush, FLUSH_INTERVAL_MS);

  /* Scroll depth, reported at quarter milestones only. */
  let scrollTick = false;
  const onScroll = () => {
    if (scrollTick) return;
    scrollTick = true;
    window.requestAnimationFrame(() => {
      scrollTick = false;
      const doc = document.documentElement;
      const reach = doc.scrollHeight - window.innerHeight;
      if (reach <= 0) return;

      const depth = Math.min(100, Math.round((window.scrollY / reach) * 100));
      const milestone = Math.floor(depth / 25) * 25;
      if (milestone > state.maxScroll) {
        state.maxScroll = milestone;
        if (milestone > 0) track('scroll_depth', { value: milestone });
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* A heartbeat while the tab is visible, so time-on-page is real time spent. */
  const beat = () => {
    if (document.visibilityState !== 'visible') return;
    const now = Date.now();
    const delta = now - state.lastBeat;
    state.lastBeat = now;
    if (delta > 0 && delta < 90_000) track('heartbeat', { durationMs: delta });
  };
  const beatTimer = window.setInterval(beat, 15_000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      state.lastBeat = Date.now();
    } else {
      beat();
      flush({ beacon: true });
    }
  });

  /* Outbound links and mailto clicks, captured at the document level. */
  document.addEventListener(
    'click',
    (event) => {
      const anchor = event.target.closest?.('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';

      if (href.startsWith('mailto:')) {
        track('copy_email', { label: href.replace('mailto:', '') });
      } else if (/^https?:\/\//i.test(href) && !href.includes(window.location.host)) {
        track('outbound', { label: href.slice(0, 200) });
      }
    },
    { capture: true },
  );

  window.addEventListener('pagehide', () => {
    track('exit', { durationMs: Date.now() - state.lastBeat, value: state.maxScroll });
    flush({ beacon: true });
    window.clearInterval(state.timer);
    window.clearInterval(beatTimer);
  });
}

export default { initTracker, track, trackSection, identify, optOut, hasOptedOut, getIds };
