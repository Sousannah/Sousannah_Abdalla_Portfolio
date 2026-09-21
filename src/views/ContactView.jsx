import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Copy, Linkedin, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useProfile } from '../lib/content.jsx';
import api, { ApiError } from '../lib/api.js';
import { getIds, track } from '../lib/tracker.js';
import { WhatsAppIcon, useWhatsApp } from '../components/WhatsAppButton.jsx';

const EMPTY = { name: '', email: '', company: '', subject: '', message: '', website: '' };

const SUBJECTS = [
  'Full-time role',
  'Contract / freelance',
  'Odenta',
  'Speaking or collaboration',
  'Something else',
];

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-ink-soft dark:text-white/65">
        {label}
      </span>
      {children}
      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-system-red"
          >
            <AlertCircle size={13} /> {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}

export default function ContactView() {
  const profile = useProfile();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));

    if (!touched) {
      setTouched(true);
      track('form_start', { label: 'contact', section: 'contact' });
    }
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Please tell me your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      next.email = 'That email does not look right.';
    }
    if (form.message.trim().length < 10) next.message = 'A little more detail would help.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setServerError('');
    if (!validate()) return;

    setStatus('sending');
    try {
      const { visitorId, sessionId } = getIds();
      await api.post('/contact', { ...form, visitorId, sessionId });
      setStatus('sent');
      setForm(EMPTY);
    } catch (error) {
      setStatus('error');
      if (error instanceof ApiError && error.fields) setErrors(error.fields);
      setServerError(error.message || 'Could not send the message.');
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      track('copy_email', { label: profile.email, section: 'contact' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const whatsappHref = useWhatsApp();

  const details = [
    profile.email && { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    profile.phone && { icon: Phone, label: 'Phone', value: profile.phone, href: `tel:${profile.phoneHref}` },
    whatsappHref && { icon: WhatsAppIcon, label: 'WhatsApp', value: 'Message me on WhatsApp', href: whatsappHref },
    profile.linkedin && { icon: Linkedin, label: 'LinkedIn', value: 'Connect on LinkedIn', href: profile.linkedin },
    profile.location && { icon: MapPin, label: 'Based in', value: profile.location },
  ].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-24 md:px-8">
      <header className="mb-10 text-center">
        <p className="eyebrow">Contact</p>
        <h2 className="mt-3 text-headline gradient-text">Let&rsquo;s talk</h2>
        <p className="mx-auto mt-4 max-w-md text-[15.5px] text-ink-muted dark:text-white/55">
          Whether it is a role, a build, or a question about Odenta — write to me and it lands
          straight in my inbox.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr,1.35fr] lg:gap-12">
        <div className="space-y-1">
          {details.map(({ icon: Icon, label, value, href }) => {
            const Wrapper = href ? 'a' : 'div';
            return (
              <Wrapper
                key={label}
                href={href}
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className={`flex items-center gap-4 rounded-apple p-3.5 transition-colors duration-300
                  ${href ? 'hover:bg-black/[.035] dark:hover:bg-white/[.05]' : ''}`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] uppercase tracking-[.06em] text-ink-faint">
                    {label}
                  </span>
                  <span className="block truncate text-[15px] font-medium">{value}</span>
                </span>
              </Wrapper>
            );
          })}

          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              onClick={() => track('whatsapp_click', { label: 'whatsapp', section: 'contact' })}
              className="mt-4 flex items-center justify-center gap-2 rounded-pill bg-[#25D366] px-5 py-3
                text-[14.5px] font-semibold text-white shadow-card transition-all duration-300
                ease-apple hover:-translate-y-0.5 hover:shadow-lift active:translate-y-0"
            >
              <WhatsAppIcon size={18} />
              Chat on WhatsApp
            </a>
          )}

          <button
            onClick={copyEmail}
            className="mt-4 inline-flex items-center gap-2 rounded-pill border hairline px-4 py-2
              text-[13.5px] font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            {copied ? <Check size={14} className="text-system-green" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy email address'}
          </button>
        </div>

        <div className="rounded-panel border hairline bg-surface-raised p-7 shadow-card
          dark:bg-white/[.035] md:p-8">
          <AnimatePresence mode="wait">
            {status === 'sent' ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[360px] flex-col items-center justify-center text-center"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="grid h-16 w-16 place-items-center rounded-full bg-system-green/12 text-system-green"
                >
                  <Check size={30} />
                </motion.span>
                <h3 className="mt-6 text-title">Message sent</h3>
                <p className="mt-3 max-w-sm text-[15.5px] text-ink-muted dark:text-white/55">
                  Thanks for reaching out. It is in my inbox and I usually reply within a day or two.
                </p>
                <button onClick={() => setStatus('idle')} className="btn-secondary mt-8">
                  Send another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={submit}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-5"
              >
                {/* Honeypot: invisible to people, irresistible to bots. */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={update('website')}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute h-0 w-0 opacity-0"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" error={errors.name}>
                    <input type="text" value={form.name} onChange={update('name')}
                      placeholder="Your name" autoComplete="name" className="field" />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input type="email" value={form.email} onChange={update('email')}
                      placeholder="you@company.com" autoComplete="email" className="field" />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Company (optional)">
                    <input type="text" value={form.company} onChange={update('company')}
                      placeholder="Where you work" autoComplete="organization" className="field" />
                  </Field>
                  <Field label="What is this about?">
                    <select value={form.subject} onChange={update('subject')} className="field">
                      <option value="">Choose one</option>
                      {SUBJECTS.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Message" error={errors.message}>
                  <textarea value={form.message} onChange={update('message')} rows={5}
                    placeholder="Tell me what you are working on…" className="field resize-none" />
                </Field>

                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-2.5 rounded-apple bg-system-red/[.08] p-3.5
                        text-[13.5px] text-system-red"
                    >
                      <AlertCircle size={16} className="mt-px shrink-0" />
                      {serverError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
                  {status === 'sending' ? (
                    <><Loader2 size={16} className="animate-spin" /> Sending…</>
                  ) : (
                    <><Send size={16} /> Send message</>
                  )}
                </button>

                <p className="text-center text-[12.5px] text-ink-faint">
                  Goes straight to {profile.email}. No newsletter, no list.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
