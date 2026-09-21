import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Download, Loader2, X } from 'lucide-react';
import { useProfile } from '../lib/content.jsx';
import { mediaUrl } from '../lib/api.js';
import { useScrollLock } from '../hooks/index.js';
import { identify, track } from '../lib/tracker.js';

/**
 * Asks for a name and email before handing over the CV. This is the one place
 * an anonymous visitor becomes a named lead — `identify()` ties the details to
 * everything already recorded for them.
 *
 * "Skip" is deliberate: gating the download outright costs more good leads
 * than it captures.
 */
export default function ResumeGate({ open, onClose }) {
  const profile = useProfile();
  const [form, setForm] = useState({ name: '', email: '', company: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useScrollLock(open);

  const startDownload = () => {
    track('download', { label: 'resume', section: 'resume-gate' });
    const link = document.createElement('a');
    link.href = mediaUrl(profile.resumeUrl) || '/cv.pdf';
    link.download = `${(profile.name || 'CV').replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      setError('That email does not look right.');
      return;
    }

    setBusy(true);
    await identify({ ...form, intent: 'resume' });
    setBusy(false);
    startDownload();
    onClose();
    setForm({ name: '', email: '', company: '' });
  };

  const skip = () => {
    track('download', { label: 'resume:anonymous', section: 'resume-gate' });
    startDownload();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm
            md:items-center md:p-6"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Download CV"
            onClick={(event) => event.stopPropagation()}
            initial={{ y: '100%', opacity: 0.7 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="relative w-full max-w-md rounded-t-panel bg-surface p-7 pb-9 shadow-lift
              dark:bg-night-raised md:rounded-panel md:p-9"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-full bg-black/[.06] p-2 text-ink-muted
                transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white/60"
            >
              <X size={16} />
            </button>

            <div aria-hidden className="mx-auto mb-6 h-1 w-10 rounded-full bg-black/15 dark:bg-white/20 md:hidden" />

            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl
              bg-accent/10 text-accent">
              <Download size={22} />
            </span>

            <h3 className="mt-5 text-[22px] font-semibold tracking-tight">Download my CV</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted dark:text-white/55">
              Leave your details and I will know who is reading — helpful if you want me to
              follow up. Or skip straight to the download.
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Your name"
                autoComplete="name"
                className="field"
              />
              <input
                type="email"
                value={form.email}
                onChange={(event) => {
                  setForm({ ...form, email: event.target.value });
                  setError('');
                }}
                placeholder="you@company.com"
                autoComplete="email"
                required
                className="field"
              />
              <input
                type="text"
                value={form.company}
                onChange={(event) => setForm({ ...form, company: event.target.value })}
                placeholder="Company (optional)"
                autoComplete="organization"
                className="field"
              />

              {error && (
                <p className="flex items-center gap-1.5 text-[12.5px] text-system-red">
                  <AlertCircle size={13} /> {error}
                </p>
              )}

              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Download CV
              </button>

              <button
                type="button"
                onClick={skip}
                className="w-full py-1 text-center text-[13.5px] text-ink-muted transition-colors
                  hover:text-ink dark:text-white/50 dark:hover:text-white"
              >
                Skip and download anyway
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
