import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ImagePlus, Loader2, Trash2, Upload, X } from 'lucide-react';
import api, { mediaUrl } from '../lib/api.js';
import { useScrollLock } from '../hooks/index.js';
import { ACCENTS } from '../components/ui/Primitives.jsx';

/* -------------------------------------------------------------------------- */
/* Form fields                                                                */
/* -------------------------------------------------------------------------- */

export function Text({ label, hint, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-ink-soft dark:text-white/65">
        {label}
      </span>
      <input className="field py-2.5 text-[14px]" {...props} />
      {hint && !error && <span className="mt-1 block text-[11.5px] text-ink-faint">{hint}</span>}
      {error && <span className="mt-1 block text-[11.5px] text-system-red">{error}</span>}
    </label>
  );
}

export function Area({ label, hint, rows = 4, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-ink-soft dark:text-white/65">
        {label}
      </span>
      <textarea rows={rows} className="field resize-y py-2.5 text-[14px]" {...props} />
      {hint && <span className="mt-1 block text-[11.5px] text-ink-faint">{hint}</span>}
    </label>
  );
}

/** A textarea where one line is one list item — simpler than a repeater. */
export function Lines({ label, hint, value, onChange, rows = 5 }) {
  return (
    <Area
      label={label}
      hint={hint || 'One per line.'}
      rows={rows}
      value={Array.isArray(value) ? value.join('\n') : value || ''}
      onChange={(event) => onChange(event.target.value.split('\n'))}
    />
  );
}

export function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors duration-300
          ${checked ? 'bg-system-green' : 'bg-black/15 dark:bg-white/20'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all
            duration-300 ${checked ? 'left-[18px]' : 'left-0.5'}`}
        />
      </button>
      <span>
        <span className="block text-[13.5px] font-medium">{label}</span>
        {hint && <span className="block text-[11.5px] text-ink-faint">{hint}</span>}
      </span>
    </label>
  );
}

/** The accent colour each card and marker uses on the public site. */
export function AccentPicker({ value, onChange }) {
  return (
    <div>
      <span className="mb-1.5 block text-[12.5px] font-medium text-ink-soft dark:text-white/65">
        Accent colour
      </span>
      <div className="flex flex-wrap gap-2">
        {Object.keys(ACCENTS).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            aria-label={name}
            aria-pressed={value === name}
            className={`h-8 w-8 rounded-full transition-transform duration-200 hover:scale-110
              ${ACCENTS[name].bg}
              ${value === name ? 'ring-2 ring-ink ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-night-raised' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Images                                                                     */
/* -------------------------------------------------------------------------- */

/** Upload one or more images and hand back their URLs. */
export function useUpload() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = useCallback(async (fileList) => {
    const files = [...fileList];
    if (!files.length) return [];

    setBusy(true);
    setError('');

    const body = new FormData();
    files.forEach((file) => body.append('files', file));

    try {
      // FormData must not be JSON-encoded, so this bypasses the api helper.
      const response = await fetch(api.url('/content/media'), {
        method: 'POST',
        body,
        credentials: 'include',
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(payload.error || 'Upload failed.');
      return payload.files.map((file) => file.url);
    } catch (uploadError) {
      setError(uploadError.message);
      return [];
    } finally {
      setBusy(false);
    }
  }, []);

  return { send, busy, error };
}

/** A single image slot: drop, browse, preview, clear. */
export function ImageField({ label, hint, value, onChange, aspect = 'aspect-[4/3]' }) {
  const { send, busy, error } = useUpload();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const receive = async (files) => {
    const [url] = await send(files);
    if (url) onChange(url);
  };

  return (
    <div>
      <span className="mb-1.5 block text-[12.5px] font-medium text-ink-soft dark:text-white/65">
        {label}
      </span>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          receive(event.dataTransfer.files);
        }}
        className={`relative overflow-hidden rounded-apple border-2 border-dashed transition-colors
          ${aspect}
          ${dragging ? 'border-accent bg-accent/[.06]' : 'border-black/[.12] dark:border-white/[.15]'}`}
      >
        {value ? (
          <>
            <img src={mediaUrl(value)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove image"
              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full
                bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/70"
            >
              <X size={15} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 p-4
              text-ink-faint transition-colors hover:text-ink dark:hover:text-white"
          >
            {busy ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
            <span className="text-[12.5px]">
              {busy ? 'Uploading…' : 'Drop an image, or click to browse'}
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => receive(event.target.files)}
        />
      </div>

      {hint && <span className="mt-1 block text-[11.5px] text-ink-faint">{hint}</span>}
      {error && <span className="mt-1 block text-[11.5px] text-system-red">{error}</span>}
    </div>
  );
}

/** Several images, for a project's screenshot gallery. */
export function GalleryField({ label, value = [], onChange }) {
  const { send, busy, error } = useUpload();
  const inputRef = useRef(null);

  const add = async (files) => {
    const urls = await send(files);
    if (urls.length) onChange([...value, ...urls]);
  };

  return (
    <div>
      <span className="mb-1.5 block text-[12.5px] font-medium text-ink-soft dark:text-white/65">
        {label}
      </span>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((url) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg">
            <img src={mediaUrl(url)} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((item) => item !== url))}
              aria-label="Remove"
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full
                bg-black/55 text-white opacity-0 backdrop-blur-md transition-opacity
                group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="grid aspect-square place-items-center rounded-lg border-2 border-dashed
            border-black/[.12] text-ink-faint transition-colors hover:border-accent hover:text-accent
            dark:border-white/[.15]"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => add(event.target.files)}
      />
      {error && <span className="mt-1 block text-[11.5px] text-system-red">{error}</span>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shell                                                                      */
/* -------------------------------------------------------------------------- */

/** The slide-over every content form lives in. */
export function EditorSheet({ open, title, subtitle, onClose, onSave, onDelete, saving, children }) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex justify-end bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(event) => event.stopPropagation()}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            className="flex h-full w-full max-w-xl flex-col bg-surface shadow-lift dark:bg-night-raised"
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b
              border-black/[.06] px-6 py-5 dark:border-white/[.08]">
              <div className="min-w-0">
                <h2 className="truncate text-[17px] font-semibold tracking-tight">{title}</h2>
                {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-faint">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-faint
                  transition-colors hover:bg-black/[.05] dark:hover:bg-white/10"
              >
                <X size={17} />
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">{children}</div>

            <footer className="flex shrink-0 items-center justify-between gap-3 border-t
              border-black/[.06] px-6 py-4 dark:border-white/[.08]">
              {onDelete ? (
                <button
                  onClick={onDelete}
                  className="inline-flex items-center gap-2 rounded-pill px-3.5 py-2 text-[13px]
                    font-medium text-system-red transition-colors hover:bg-system-red/10"
                >
                  <Trash2 size={14} /> Delete
                </button>
              ) : (
                <span />
              )}

              <div className="flex gap-2">
                <button onClick={onClose} className="btn-secondary px-5 py-2 text-[13.5px]">
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="btn-primary px-5 py-2 text-[13.5px]"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Brief confirmation that a save landed. */
export function SavedToast({ show, message = 'Saved' }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2
            rounded-pill bg-ink px-4 py-2.5 text-[13.5px] font-medium text-white shadow-lift
            dark:bg-white dark:text-ink"
        >
          <Check size={15} /> {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
