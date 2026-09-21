import { Brain, Cloud, Layers, Mic } from 'lucide-react';
import { skillGroups } from '../data/profile.js';
import { Card, Reveal, Section, SectionHeading, accent } from './ui/Primitives.jsx';

const ICONS = { brain: Brain, mic: Mic, layers: Layers, cloud: Cloud };

export default function Skills() {
  return (
    <Section id="skills">
      <div className="shell">
        <SectionHeading
          align="left"
          eyebrow="Toolkit"
          title="What I work with"
          lede="From fine-tuning vision-language models to shipping the app that serves them."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {skillGroups.map((group, groupIndex) => {
            const Icon = ICONS[group.icon] || Brain;
            const tone = accent(group.accent);

            return (
              <Reveal key={group.name} delay={groupIndex * 80}>
                <Card className="h-full p-7">
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl
                        ${tone.soft} ${tone.text}`}
                    >
                      <Icon size={20} />
                    </span>
                    <h3 className="text-[17px] font-semibold tracking-tight">{group.name}</h3>
                  </div>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <li
                        key={skill}
                        className="rounded-pill border hairline bg-white/60 px-3 py-1.5 text-[13px]
                          text-ink-soft transition-colors duration-300 hover:border-accent/30
                          hover:bg-accent/[.06] hover:text-accent dark:bg-white/[.05] dark:text-white/65
                          dark:hover:bg-accent/15 dark:hover:text-accent-soft"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
