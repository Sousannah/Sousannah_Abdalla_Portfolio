import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cloud, Layers, Mic, Sparkles } from 'lucide-react';
import { useContent } from '../lib/content.jsx';
import { accent } from '../components/ui/Primitives.jsx';

const ICONS = { brain: Brain, mic: Mic, layers: Layers, cloud: Cloud, sparkles: Sparkles };

export default function SkillsView({ focus }) {
  const { skillGroups } = useContent();
  const [active, setActive] = useState(null);

  // Arriving from the ask bar: highlight the group that matched.
  useEffect(() => {
    if (focus?.type !== 'skillGroup') return undefined;
    const match = skillGroups.find((g) => g.id === focus.id || g.name === focus.name);
    if (!match) return undefined;

    setActive(match.id);
    const timer = setTimeout(() => {
      document.getElementById(`skills-${match.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [focus, skillGroups]);

  const total = skillGroups.reduce((sum, group) => sum + (group.skills?.length || 0), 0);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-24 md:px-8">
      <header className="mb-10 text-center">
        <p className="eyebrow">Toolkit</p>
        <h2 className="mt-3 text-headline gradient-text">What I work with</h2>
        <p className="mx-auto mt-4 max-w-md text-[15.5px] text-ink-muted dark:text-white/55">
          {total} tools and techniques, from fine-tuning vision-language models to shipping the app
          that serves them.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {skillGroups.map((group, groupIndex) => {
          const Icon = ICONS[group.icon] || Brain;
          const tone = accent(group.accent);
          const isActive = active === group.id;

          return (
            <motion.div
              key={group.id}
              id={`skills-${group.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: groupIndex * 0.07, ease: [0.28, 0.11, 0.32, 1] }}
              className={`rounded-card border bg-surface-raised p-6 transition-shadow duration-300
                dark:bg-white/[.035]
                ${isActive ? 'border-accent/40 shadow-lift' : 'hairline'}`}
            >
              <div className="flex items-center gap-3.5">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone.soft} ${tone.text}`}>
                  <Icon size={19} />
                </span>
                <div>
                  <h3 className="text-[16.5px] font-semibold tracking-tight">{group.name}</h3>
                  <p className="text-[12px] text-ink-faint">{group.skills?.length || 0} items</p>
                </div>
              </div>

              <ul className="mt-5 flex flex-wrap gap-1.5">
                {(group.skills || []).map((skill, skillIndex) => (
                  <motion.li
                    key={skill}
                    initial={{ opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: Math.min(skillIndex * 0.015, 0.35) }}
                    className="rounded-pill border hairline bg-white/60 px-2.5 py-1 text-[12.5px]
                      text-ink-soft transition-colors duration-300 hover:border-accent/30
                      hover:bg-accent/[.06] hover:text-accent dark:bg-white/[.05]
                      dark:text-white/65 dark:hover:bg-accent/15 dark:hover:text-accent-soft"
                  >
                    {skill}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
