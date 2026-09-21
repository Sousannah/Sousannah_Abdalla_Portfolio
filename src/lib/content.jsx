import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from './api.js';
import { fallbackContent } from '../data/fallback.js';

const ContentContext = createContext(null);

/**
 * Loads the site's content from the API once and hands it to every view.
 *
 * If the API cannot be reached the bundled fallback is used instead, so the
 * portfolio still renders something truthful rather than an error page — a
 * visitor should never see a blank site because the backend is restarting.
 */
export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [state, setState] = useState('loading'); // loading | live | fallback

  const load = useCallback(async ({ fresh = false } = {}) => {
    try {
      // The public content response is cacheable for 30s, which is right for
      // visitors but wrong straight after an edit — the dashboard asks for a
      // fresh copy so a save is reflected immediately.
      const data = await api.get(fresh ? `/content?t=${Date.now()}` : '/content');
      if (!data?.profile) throw new Error('empty');
      setContent(data);
      setState('live');
    } catch {
      setContent(fallbackContent);
      setState('fallback');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const data = content ?? fallbackContent;
    return {
      ...data,
      profile: data.profile,
      state,
      loading: state === 'loading',
      reload: () => load({ fresh: true }),
    };
  }, [content, state, load]);

  // Hold the first paint until content is in, so nothing renders with
  // placeholder text and then swaps under the reader.
  if (!content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface dark:bg-night">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-accent
          dark:border-white/10 dark:border-t-accent" />
      </div>
    );
  }

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used inside a ContentProvider.');
  return context;
}

/** Convenience for the many components that only need the profile. */
export function useProfile() {
  return useContent().profile;
}
