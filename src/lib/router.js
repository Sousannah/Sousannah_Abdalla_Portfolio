/**
 * The ask bar's router.
 *
 * Turns a typed question into a destination — a section, and optionally a
 * specific project or role to open once there. No model, no network call: it
 * scores the question against the section keywords plus the live content, so
 * "what did you build at healthplans" lands on the roadmap at that company and
 * "show me odenta" opens the project.
 *
 * `resolveQuery` returns `{ sectionId, focus, confidence, reason }`, or null
 * when nothing scores above the floor.
 */

import { ALL_SECTIONS } from '../data/sections.js';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'am', 'do', 'does',
  'did', 'have', 'has', 'had', 'can', 'could', 'would', 'should', 'will', 'shall',
  'may', 'might', 'must', 'i', 'you', 'your', 'yours', 'me', 'my', 'we', 'us',
  'she', 'her', 'he', 'his', 'it', 'its', 'they', 'them', 'their', 'of', 'in',
  'on', 'at', 'to', 'for', 'with', 'about', 'from', 'by', 'as', 'and', 'or',
  'but', 'if', 'then', 'than', 'so', 'that', 'this', 'these', 'those', 'what',
  'which', 'who', 'whom', 'when', 'how', 'why', 'please', 'tell', 'show', 'give',
  'any', 'some', 'all', 'more', 'most', 'just', 'like',
]);

const normalise = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Drop the filler words, but never return nothing: a question like "who are
 * you" is entirely stop words, and it still has an obvious answer. When the
 * filter empties the query, keep the original words instead.
 */
const tokenise = (value) => {
  const words = normalise(value)
    .split(' ')
    .filter(Boolean);

  const meaningful = words.filter((word) => word.length > 1 && !STOP_WORDS.has(word));
  return meaningful.length ? meaningful : words.filter((word) => word.length > 1);
};

/**
 * Levenshtein distance, capped — used only to forgive small typos on words
 * long enough for a typo to be plausible.
 */
function within(a, b, max = 1) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > max) return false;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let best = i;

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      best = Math.min(best, current[j]);
    }

    if (best > max) return false;
    previous = current;
  }

  return previous[b.length] <= max;
}

/** How well a set of query tokens matches a phrase. */
function scorePhrase(tokens, phrase, { weight = 1, allowFuzzy = true } = {}) {
  const text = normalise(phrase);
  if (!text) return 0;

  const words = new Set(text.split(' '));
  let score = 0;

  for (const token of tokens) {
    if (words.has(token)) {
      score += weight;
      continue;
    }
    // A half-typed word should still match — but only at the start of a word.
    // A plain substring test lets a short token like "are" hit inside
    // "healthcare" and "software", which is how "who are you" ended up
    // scoring against half the projects.
    if (token.length >= 4 && [...words].some((word) => word.startsWith(token))) {
      score += weight * 0.75;
      continue;
    }
    if (allowFuzzy && token.length >= 5) {
      for (const word of words) {
        if (word.length >= 5 && within(token, word)) {
          score += weight * 0.7;
          break;
        }
      }
    }
  }

  return score;
}

/**
 * Build the searchable index from whatever content is loaded, so a project
 * added in the dashboard is findable immediately without a code change.
 */
export function buildIndex({ projects = [], experiences = [], skillGroups = [], profile = {} } = {}) {
  const entries = [];

  for (const project of projects) {
    entries.push({
      sectionId: 'work',
      focus: { type: 'project', id: project.id, name: project.name },
      terms: [
        { text: project.name, weight: 3 },
        { text: project.category, weight: 1 },
        { text: project.tagline, weight: 1 },
        { text: (project.stack || []).join(' '), weight: 1 },
        { text: project.description, weight: 0.4 },
      ],
    });
  }

  for (const experience of experiences) {
    entries.push({
      sectionId: 'roadmap',
      focus: { type: 'experience', id: experience.id, name: experience.company },
      terms: [
        { text: experience.company, weight: 3 },
        { text: experience.role, weight: 1.5 },
        { text: experience.summary, weight: 0.6 },
        { text: (experience.stack || []).join(' '), weight: 0.8 },
      ],
    });
  }

  for (const group of skillGroups) {
    entries.push({
      sectionId: 'skills',
      focus: { type: 'skillGroup', id: group.id, name: group.name },
      terms: [
        { text: group.name, weight: 2 },
        { text: (group.skills || []).join(' '), weight: 1.5 },
      ],
    });
  }

  if (profile?.publication?.title) {
    entries.push({
      sectionId: 'research',
      focus: { type: 'publication', name: profile.publication.title },
      terms: [
        { text: profile.publication.title, weight: 2 },
        { text: profile.publication.venue, weight: 1.5 },
        { text: profile.publication.id, weight: 2 },
      ],
    });
  }

  if (profile?.education?.school) {
    entries.push({
      sectionId: 'research',
      focus: { type: 'education', name: profile.education.school },
      terms: [
        { text: profile.education.school, weight: 2 },
        { text: profile.education.degree, weight: 1.5 },
        { text: (profile.education.coursework || []).join(' '), weight: 1 },
      ],
    });
  }

  return entries;
}

// One exact keyword hit scores KEYWORD_WEIGHT, and a single-word question like
// "gpa" or "email" is a perfectly good query — so the floor sits below it.
const KEYWORD_WEIGHT = 1.5;
const MINIMUM_SCORE = 1;

/**
 * Resolve a typed question to a destination.
 * @returns {{sectionId: string, focus: object|null, confidence: number, reason: string}|null}
 */
export function resolveQuery(query, index = []) {
  const tokens = tokenise(query);
  if (!tokens.length) return null;

  const totals = new Map();
  const add = (sectionId, amount, focus, reason) => {
    const current = totals.get(sectionId) || { score: 0, focus: null, reason: '' };
    current.score += amount;
    // Keep the strongest single hit as the thing to scroll to.
    if (focus && amount > (current.focusScore || 0)) {
      current.focus = focus;
      current.focusScore = amount;
      current.reason = reason;
    }
    totals.set(sectionId, current);
  };

  // Content first: a project or company name is the most specific signal there is.
  for (const entry of index) {
    let score = 0;
    for (const term of entry.terms) {
      score += scorePhrase(tokens, term.text, { weight: term.weight });
    }
    if (score > 0) add(entry.sectionId, score, entry.focus, entry.focus?.name);
  }

  // Then the section keywords, which catch the questions that name no content.
  for (const section of ALL_SECTIONS) {
    let score = 0;
    for (const keyword of section.keywords) {
      score += scorePhrase(tokens, keyword, { weight: KEYWORD_WEIGHT });
    }
    if (score > 0) add(section.id, score, null, section.label);
  }

  const ranked = [...totals.entries()].sort((a, b) => b[1].score - a[1].score);
  if (!ranked.length) return null;

  const [sectionId, best] = ranked[0];
  if (best.score < MINIMUM_SCORE) return null;

  const runnerUp = ranked[1]?.[1].score ?? 0;

  return {
    sectionId,
    focus: best.focus,
    // How far clear of the next-best section this result is, 0–1.
    confidence: Math.min(1, (best.score - runnerUp) / Math.max(best.score, 1) + 0.25),
    reason: best.reason || '',
  };
}

/** Up to `limit` live suggestions for the dropdown under the ask bar. */
export function suggestFor(query, index = [], limit = 5) {
  const tokens = tokenise(query);
  if (!tokens.length) return [];

  return index
    .map((entry) => {
      let score = 0;
      for (const term of entry.terms) {
        score += scorePhrase(tokens, term.text, { weight: term.weight });
      }
      return { entry, score };
    })
    .filter((item) => item.score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      sectionId: item.entry.sectionId,
      focus: item.entry.focus,
      label: item.entry.focus?.name,
      type: item.entry.focus?.type,
    }));
}
