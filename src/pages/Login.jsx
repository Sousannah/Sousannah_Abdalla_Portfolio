import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      await login(email, password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden
      bg-surface-sunken px-5 dark:bg-night">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full
          bg-gradient-to-br from-system-blue/15 to-system-indigo/10 blur-[110px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.28, 0.11, 0.32, 1] }}
        className="relative w-full max-w-sm"
      >
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[13.5px] text-ink-muted
            transition-colors hover:text-ink dark:text-white/50 dark:hover:text-white"
        >
          <ArrowLeft size={14} /> Back to the site
        </Link>

        <div className="rounded-panel border hairline bg-surface p-8 shadow-card dark:bg-night-raised">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl
            bg-accent/10 text-accent">
            <Lock size={21} />
          </span>

          <h1 className="mt-5 text-[24px] font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1.5 text-[14.5px] text-ink-muted dark:text-white/55">
            Sign in to see who has been visiting.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              required
              className="field"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              className="field"
            />

            {error && (
              <p className="flex items-center gap-1.5 text-[13px] text-system-red">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
