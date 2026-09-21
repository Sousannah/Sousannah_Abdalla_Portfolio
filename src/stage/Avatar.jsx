import { useState } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '../lib/content.jsx';
import { mediaUrl } from '../lib/api.js';

/**
 * The one avatar on the site. It carries a shared `layoutId`, so when a section
 * opens the same element travels from the middle of the landing up into the
 * header rather than one fading out while another fades in.
 *
 * Falls back to initials on a generated gradient until a photo is uploaded in
 * the dashboard, so the site never shows a broken image.
 */
export default function Avatar({ size = 'hero', onClick, className = '' }) {
  const profile = useProfile();
  const [broken, setBroken] = useState(false);

  const dimensions = {
    hero: 'h-44 w-44 md:h-56 md:w-56',
    header: 'h-11 w-11',
    small: 'h-9 w-9',
  }[size];

  const initials = (profile.name || '?')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const showPhoto = profile.avatarUrl && !broken;

  const Tag = onClick ? motion.button : motion.div;

  return (
    <Tag
      layoutId="site-avatar"
      onClick={onClick}
      aria-label={onClick ? 'Back to the start' : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className={`relative shrink-0 overflow-hidden rounded-full ${dimensions} ${className}
        ${onClick ? 'cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95' : ''}`}
    >
      {showPhoto ? (
        <img
          src={mediaUrl(profile.avatarUrl)}
          alt={profile.name}
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center bg-gradient-to-br
            from-system-blue via-system-indigo to-system-purple font-semibold text-white"
          style={{ fontSize: size === 'hero' ? '3.5rem' : size === 'header' ? '.95rem' : '.8rem' }}
        >
          {initials}
        </span>
      )}

      {/* A soft inner edge, so the circle reads as an object rather than a crop. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-black/[.06]
          dark:ring-white/[.10]"
      />
    </Tag>
  );
}
