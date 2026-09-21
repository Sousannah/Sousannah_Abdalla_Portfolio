import { Compass, Rocket, Users } from 'lucide-react';
import { languages, leadership, person } from '../data/profile.js';
import { Card, Section, SectionHeading, Stagger, StaggerItem, accent } from './ui/Primitives.jsx';

const ICONS = { compass: Compass, rocket: Rocket, users: Users };

export default function About() {
  return (
    <Section id="about" className="bg-surface-sunken dark:bg-night-sunken">
      <div className="shell">
        <SectionHeading
          align="left"
          eyebrow="About"
          title={person.tagline}
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.25fr,1fr] lg:gap-16">
          <div className="space-y-6">
            {person.about.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="text-[17px] leading-[1.7] text-ink-soft dark:text-white/65 md:text-[19px]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="p-6" hover={false}>
              <h3 className="text-[13px] font-semibold uppercase tracking-[.08em] text-ink-faint">
                Languages
              </h3>
              <ul className="mt-5 space-y-5">
                {languages.map((language) => (
                  <li key={language.name}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[15px] font-medium">{language.name}</span>
                      <span className="text-[12.5px] text-ink-faint">{language.level}</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/[.07] dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-system-blue to-system-indigo"
                        style={{ width: `${language.value}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <Stagger className="mt-16 grid gap-5 md:grid-cols-3">
          {leadership.map((item) => {
            const Icon = ICONS[item.icon] || Compass;
            const tone = accent(item.accent);

            return (
              <StaggerItem key={item.title}>
                <Card className="h-full p-7">
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl
                      ${tone.soft} ${tone.text}`}
                  >
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-5 text-[17px] font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-muted dark:text-white/55">
                    {item.body}
                  </p>
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </Section>
  );
}
