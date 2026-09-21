/**
 * Thin fetch wrapper. In development Vite proxies /api to the backend, so the
 * browser stays on one origin and the auth cookie works without extra config.
 */
const BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields || null;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;

  try {
    response = await fetch(`${BASE}/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Could not reach the server. Is the API running?', 0);
  }

  if (response.status === 204) return null;

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => ({})) : null;

  if (!response.ok) {
    throw new ApiError(
      payload?.error || `Request failed (${response.status})`,
      response.status,
      payload?.fields,
    );
  }

  return payload;
}

/**
 * Resolve a stored upload path against the API's origin.
 *
 * Uploads are stored as site-relative paths like `/uploads/cover-ab12.png`.
 * That works when one server serves both, but in production the front-end is on
 * one domain and the API on another, so a bare path would resolve against the
 * front-end and 404. Anything already absolute is passed straight through, so
 * an external image URL still works.
 */
export function mediaUrl(path) {
  if (!path) return path;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (!BASE) return path;
  return `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  /** Full URL for endpoints the browser downloads rather than parses. */
  url: (path) => `${BASE}/api${path}`,
};

export default api;
