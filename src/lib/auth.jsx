import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  /**
   * The session lives in an httpOnly cookie, so the only way to know whether we
   * are signed in is to ask the server — but only the dashboard ever needs to
   * know. Public visitors would otherwise pay for a guaranteed 401 on every
   * page load, so the check is deferred until a guarded route asks for it.
   */
  const ensureChecked = useCallback(async () => {
    if (checked) return;
    setLoading(true);
    try {
      const data = await api.get('/auth/me');
      setAdmin(data.admin);
    } catch {
      setAdmin(null);
    } finally {
      setChecked(true);
      setLoading(false);
    }
  }, [checked]);

  const login = useCallback(async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    setAdmin(data.admin);
    setChecked(true);
    return data.admin;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ admin, loading, checked, ensureChecked, login, logout }),
    [admin, loading, checked, ensureChecked, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider.');
  return context;
}

/** Wraps the dashboard routes: no session, no entry. */
export function RequireAuth({ children }) {
  const { admin, loading, checked, ensureChecked } = useAuth();
  const location = useLocation();

  useEffect(() => {
    ensureChecked();
  }, [ensureChecked]);

  if (!checked || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken dark:bg-night">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-accent
          dark:border-white/10 dark:border-t-accent" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  return children;
}
