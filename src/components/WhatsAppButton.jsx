import { useProfile } from '../lib/content.jsx';
import { track } from '../lib/tracker.js';

/**
 * The WhatsApp glyph. lucide has no brand marks, and a generic speech bubble
 * does not read as "WhatsApp" the way the real outline does — which is the
 * whole point of putting it on screen.
 */
function WhatsAppIcon({ size = 22 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.84c2.15 0 4.17.84 5.69 2.36a8 8 0 0 1 2.36 5.7c0 4.45-3.62 8.07-8.07 8.07h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.82.83-3.04-.2-.31a8.02 8.02 0 0 1-1.23-4.29c0-4.45 3.62-8.07 8.07-8.07z" />
    </svg>
  );
}

/**
 * Build the wa.me link from the profile. Digits only — wa.me rejects spaces and
 * a leading plus — and an opening line so the person does not have to write one.
 */
export function useWhatsApp() {
  const profile = useProfile();
  if (!profile.whatsapp) return null;

  const number = String(profile.whatsapp).replace(/\D/g, '');
  if (!number) return null;

  const greeting = `Hi ${profile.firstName || profile.name}, I found your portfolio and wanted to get in touch.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(greeting)}`;
}

export { WhatsAppIcon };

/**
 * A floating WhatsApp button, present on every screen.
 *
 * It sits above the dock on a phone and clear of it on desktop, so it never
 * covers the navigation. Clicks are tracked like any other conversion, which is
 * what makes WhatsApp enquiries visible in the dashboard next to form ones.
 */
export default function WhatsAppButton() {
  const href = useWhatsApp();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Message me on WhatsApp"
      onClick={() => track('whatsapp_click', { label: 'floating', section: 'global' })}
      className="group fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-5 z-[60]
        flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white
        shadow-lift transition-all duration-300 ease-apple hover:scale-105 active:scale-95
        motion-safe:animate-none md:bottom-8 md:right-8"
    >
      {/* A slow pulse behind the button, so the eye finds it without it moving. */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[#25D366] opacity-60
          motion-safe:animate-ping motion-reduce:hidden"
        style={{ animationDuration: '2.8s' }}
      />
      <WhatsAppIcon size={26} />
      <span
        className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-pill
          bg-ink px-3 py-1.5 text-[13px] font-medium text-surface opacity-0 shadow-card
          transition-opacity duration-300 group-hover:opacity-100 dark:bg-white dark:text-night
          md:block"
      >
        Message me on WhatsApp
      </span>
    </a>
  );
}
