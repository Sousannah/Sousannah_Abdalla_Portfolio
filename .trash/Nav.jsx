import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { navLinks, person } from '../data/profile.js';
import { useActiveSection, useScrolled, useScrollLock, useTheme } from '../hooks/index.js';
import { track } from '../lib/tracker.js';

const SECTION_IDS = navLinks.map((link) => link.id);

export default function Nav() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(8);
  const active = useActiveSection(SECTION_IDS);
  const { theme, toggle } = useTheme();

  useScrollLock(open);

  const go = (id) => {
    setOpen(false);
    track('click', { label: `nav:${id}`, section: 'nav' });
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* The 48px frosted bar Apple puts at the top of every page. */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-apple
          ${scrolled || open ? 'chrome-blur border-b hairline' : 'bg-transparent'}`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <nav className="shell flex h-12 items-center justify-between" aria-label="Main">
          <button
            onClick={() => {
              track('click', { label: 'nav:home', section: 'nav' });
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-[15px] font-semibold tracking-tight transition-opacity hover:opacity-60"
          >
            {person.name}
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => go(link.id)}
                  className={`relative rounded-pill px-3.5 py-1.5 text-[13px] transition-colors duration-300
                    ${active === link.id
                      ? 'text-ink dark:text-white'
                      : 'text-ink-muted hover:text-ink dark:text-white/55 dark:hover:text-white'}`}
                >
                  {active === link.id && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-pill bg-black/[.06] dark:bg-white/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <button
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-full p-2 text-ink-muted transition-colors hover:bg-black/[.05]
                hover:text-ink dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => go('contact')}
              className="hidden rounded-pill bg-accent px-4 py-1.5 text-[13px] font-medium text-white
                transition-all duration-300 hover:bg-accent-hover md:inline-flex"
            >
              Get in touch
            </button>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="rounded-full p-2 text-ink transition-colors hover:bg-black/[.05]
                dark:text-white dark:hover:bg-white/10 md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Full-height sheet, the way iOS presents a menu on a phone. */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 chrome-blur md:hidden"
            style={{ paddingTop: 'calc(48px + env(safe-area-inset-top))' }}
          >
            <motion.ul
              className="shell flex flex-col gap-1 py-6"
              initial="hidden"
              animate="shown"
              variants={{ shown: { transition: { staggerChildren: 0.05 } } }}
            >
              {navLinks.map((link) => (
                <motion.li
                  key={link.id}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    shown: { opacity: 1, y: 0 },
                  }}
                >
                  <button
                    onClick={() => go(link.id)}
                    className="w-full border-b hairline py-4 text-left text-[22px] font-medium tracking-tight"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
              <motion.li
                variants={{ hidden: { opacity: 0, y: 16 }, shown: { opacity: 1, y: 0 } }}
                className="pt-6"
              >
                <a href={`mailto:${person.email}`} className="btn-primary w-full">
                  Email me
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
