/**
 * Refresh src/data/fallback.js from the running API.
 *
 * The database is the source of truth; this snapshot is only what the site
 * falls back to when the API cannot be reached. Re-run it after a round of
 * content edits so the offline copy does not drift:
 *
 *   npm run snapshot
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = process.env.API_URL || 'http://localhost:5000';
const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(here, '..', 'src', 'data', 'fallback.js');

const response = await fetch(`${API}/api/content`).catch(() => null);
if (!response?.ok) {
  console.error(`Could not reach ${API}/api/content — is the backend running?`);
  process.exit(1);
}

const content = await response.json();

await fs.writeFile(
  target,
  `/**
 * A snapshot of the site content, used only when the API cannot be reached.
 * The database is the real source of truth — edit content in the dashboard, not
 * here. Regenerate with:  npm run snapshot
 *
 * Taken ${new Date().toISOString().slice(0, 10)}.
 */

export const fallbackContent = ${JSON.stringify(content, null, 2)};

export default fallbackContent;
`,
  'utf8',
);

console.log(
  `Snapshot written: ${content.experiences.length} roles, ${content.projects.length} projects, ${content.skillGroups.length} skill groups.`,
);
