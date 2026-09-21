import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { navLinks, person } from '../data/profile.js';
import { track } from '../lib/tracker.js';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t hairline bg-surface-sunken dark:bg-night-sunken">
      <div className="shell py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-[19px] font-semibold tracking-tight">{person.name}</p>
            <p className="mt-2 text-[14.5px] text-ink-muted dark:text-white/50">
              {person.title} · {person.location}
            </p>
            <a
              href={`mailto:${person.email}`}
              className="mt-4 inline-block text-[14.5px] text-accent transition-opacity hover:opacity-70"
            >
              {person.email}
            </a>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:grid-cols-3 md:grid-cols-2">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => {
                      track('click', { label: `footer:${link.id}`, section: 'footer' });
                      document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-[14px] text-ink-muted transition-colors hover:text-ink
                      dark:text-white/50 dark:hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            {[
              { href: person.linkedin, icon: Linkedin, label: 'LinkedIn' },
              { href: person.github, icon: Github, label: 'GitHub' },
              { href: `mailto:${person.email}`, icon: Mail, label: 'Email' },
            ].map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel="noreferrer"
                aria-label={label}
                className="rounded-full p-2.5 text-ink-muted transition-colors hover:bg-black/[.05]
                  hover:text-ink dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Icon size={17} />
              </a>
            ))}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="ml-1 rounded-full border hairline p-2.5 text-ink-muted transition-colors
                hover:text-ink dark:text-white/50 dark:hover:text-white"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t hairline pt-7 text-[12.5px]
          text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {person.name}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span>Built with React, Tailwind and Node.</span>
            {/* Present but low-key: the owner needs a way in, visitors do not need a tour. */}
            <Link
              to="/dashboard"
              className="transition-colors hover:text-ink dark:hover:text-white"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
