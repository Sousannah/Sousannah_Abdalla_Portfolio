import { motion } from 'framer-motion';
import { Layers, Mail, Route, Sparkles, User } from 'lucide-react';
import { SECTIONS } from '../data/sections.js';
import { accent } from '../components/ui/Primitives.jsx';

const ICONS = { user: User, route: Route, layers: Layers, sparkles: Sparkles, mail: Mail };

/**
 * The persistent navigation. On the landing it sits under the ask bar; once a
 * section is open it docks to the bottom of the screen, above the home
 * indicator on a phone.
 */
export default function Dock({ active, onSelect, floating = false }) {
  return (
    <nav
      aria-label="Sections"
      className={
        floating
          ? 'fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3'
          : 'flex justify-center'
      }
    >
      <ul
        className={`flex items-center gap-1 rounded-pill p-1.5
          ${floating
            ? 'chrome-blur border hairline shadow-lift'
            : 'border hairline bg-white/60 backdrop-blur-xl dark:bg-white/[.06]'}`}
      >
        {SECTIONS.map((section) => {
          const Icon = ICONS[section.icon] || User;
          const tone = accent(section.accent);
          const isActive = active === section.id;

          return (
            <li key={section.id}>
              <button
                onClick={() => onSelect(section.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center gap-2 rounded-pill px-3.5 py-2.5
                  text-[13px] font-medium transition-colors duration-300 sm:px-4
                  ${isActive
                    ? 'text-ink dark:text-white'
                    : 'text-ink-muted hover:text-ink dark:text-white/55 dark:hover:text-white'}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="dock-active"
                    className="absolute inset-0 rounded-pill bg-black/[.06] dark:bg-white/[.12]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon
                  size={16}
                  className={`relative transition-colors duration-300 ${isActive ? tone.text : ''}`}
                />
                {/* The label is the first thing to go when the screen is narrow. */}
                <span className="relative hidden sm:inline">{section.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
