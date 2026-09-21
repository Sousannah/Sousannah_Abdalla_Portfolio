import { motion } from 'framer-motion';
import { Award, Compass, GraduationCap, Rocket, Users } from 'lucide-react';
import { useContent } from '../lib/content.jsx';
import { Pill, accent } from '../components/ui/Primitives.jsx';
import { track } from '../lib/tracker.js';

const ICONS = { compass: Compass, rocket: Rocket, users: Users };

const fade = (index = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, delay: index * 0.06, ease: [0.28, 0.11, 0.32, 1] },
});

export default function MeView() {
  const { profile } = useContent();
  const { education, publication, languages = [], leadership = [], stats = [] } = profile;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 md:px-8">
      <header className="mb-10 text-center">
        <p className="eyebrow">About</p>
        <h2 className="mt-3 text-headline gradient-text">{profile.tagline}</h2>
      </header>

      {stats.length > 0 && (
        <motion.dl {...fade(0)} className="mb-12 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[26px] font-semibold tracking-tight md:text-[30px]">{stat.value}</dt>
              <dd className="mt-1 text-[12.5px] leading-snug text-ink-muted dark:text-white/50">
                {stat.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      )}

      <div className="space-y-5">
        {(profile.about || []).map((paragraph, index) => (
          <motion.p
            key={paragraph.slice(0, 40)}
            {...fade(index)}
            className="text-[16.5px] leading-[1.75] text-ink-soft dark:text-white/65 md:text-[18px]"
          >
            {paragraph}
          </motion.p>
        ))}
      </div>

      {leadership.length > 0 && (
        <section className="mt-14">
          <h3 className="mb-5 text-[13px] font-semibold uppercase tracking-[.08em] text-ink-faint">
            How I lead
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {leadership.map((item, index) => {
              const Icon = ICONS[item.icon] || Compass;
              const tone = accent(item.accent);
              return (
                <motion.div
                  key={item.title}
                  {...fade(index)}
                  className="rounded-card border hairline bg-surface-raised p-6 dark:bg-white/[.035]"
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-2xl ${tone.soft} ${tone.text}`}>
                    <Icon size={18} />
                  </span>
                  <h4 className="mt-4 text-[16px] font-semibold tracking-tight">{item.title}</h4>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted dark:text-white/55">
                    {item.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Research and education live here rather than in the dock. */}
      <section id="research-block" className="mt-14 grid gap-4 md:grid-cols-2">
        {publication?.title && (
          <motion.div
            {...fade(0)}
            className="relative overflow-hidden rounded-card border hairline bg-surface-raised p-6
              dark:bg-white/[.035]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full
                bg-gradient-to-br from-system-teal to-transparent opacity-[.12] blur-2xl"
            />
            <div className="relative">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-system-teal/10 text-system-teal">
                <Award size={18} />
              </span>
              <Pill tone="accent" className="ml-2.5 align-middle">IEEE {publication.year}</Pill>
              <h4 className="mt-4 text-[17px] font-semibold leading-snug tracking-tight">
                {publication.title}
              </h4>
              <p className="mt-2 text-[13px] text-ink-muted dark:text-white/55">
                {publication.authors} · {publication.venue}
              </p>
              {publication.link && (
                <a
                  href={publication.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track('outbound', { label: 'publication', section: 'me' })}
                  className="mt-4 inline-block text-[13.5px] font-medium text-accent
                    transition-opacity hover:opacity-70"
                >
                  {publication.id} →
                </a>
              )}
            </div>
          </motion.div>
        )}

        {education?.school && (
          <motion.div
            {...fade(1)}
            className="relative overflow-hidden rounded-card border hairline bg-surface-raised p-6
              dark:bg-white/[.035]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full
                bg-gradient-to-br from-system-indigo to-transparent opacity-[.12] blur-2xl"
            />
            <div className="relative">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-system-indigo/10 text-system-indigo">
                <GraduationCap size={18} />
              </span>
              <h4 className="mt-4 text-[17px] font-semibold leading-snug tracking-tight">
                {education.degree}
              </h4>
              <p className="mt-2 text-[13px] text-ink-muted dark:text-white/55">
                {education.school} · {education.period}
              </p>
              {education.gpa && (
                <p className="mt-3 text-[14px]">
                  <span className="text-ink-faint">GPA </span>
                  <span className="font-semibold">{education.gpa}</span>
                </p>
              )}
              {education.coursework?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {education.coursework.map((course) => (
                    <Pill key={course}>{course}</Pill>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </section>

      {languages.length > 0 && (
        <section className="mt-14">
          <h3 className="mb-5 text-[13px] font-semibold uppercase tracking-[.08em] text-ink-faint">
            Languages
          </h3>
          <ul className="space-y-5">
            {languages.map((language, index) => (
              <motion.li key={language.name} {...fade(index)}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[15px] font-medium">{language.name}</span>
                  <span className="text-[12.5px] text-ink-faint">{language.level}</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${language.value}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: [0.28, 0.11, 0.32, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-system-blue to-system-indigo"
                  />
                </div>
              </motion.li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
