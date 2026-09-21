import { ArrowUpRight, Award, GraduationCap } from 'lucide-react';
import { education, publication } from '../data/profile.js';
import { Card, Pill, Section, SectionHeading } from './ui/Primitives.jsx';
import { track } from '../lib/tracker.js';

export default function Research() {
  return (
    <Section id="research" className="bg-surface-sunken dark:bg-night-sunken">
      <div className="shell">
        <SectionHeading
          align="left"
          eyebrow="Research & education"
          title="Published, and still teaching"
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {/* Publication */}
          <Card className="relative overflow-hidden p-8">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full
                bg-gradient-to-br from-system-teal to-transparent opacity-[.10] blur-2xl"
            />
            <div className="relative">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl
                bg-system-teal/10 text-system-teal">
                <Award size={20} />
              </span>

              <Pill tone="accent" className="ml-3 align-middle">
                {publication.venue.includes('IEEE') ? 'IEEE' : 'Published'} {publication.year}
              </Pill>

              <h3 className="mt-6 text-[20px] font-semibold leading-snug tracking-tight md:text-[23px]">
                {publication.title}
              </h3>

              <p className="mt-3 text-[14.5px] text-ink-muted dark:text-white/55">
                {publication.authors} · {publication.venue}, {publication.year}
              </p>

              <a
                href={publication.link}
                target="_blank"
                rel="noreferrer"
                onClick={() => track('outbound', { label: 'publication', section: 'research' })}
                className="mt-7 inline-flex items-center gap-1.5 text-[14px] font-medium text-accent
                  transition-transform duration-300 hover:translate-x-0.5"
              >
                {publication.id} <ArrowUpRight size={15} />
              </a>
            </div>
          </Card>

          {/* Education */}
          <Card className="relative overflow-hidden p-8">
            <span
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full
                bg-gradient-to-br from-system-indigo to-transparent opacity-[.10] blur-2xl"
            />
            <div className="relative">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl
                bg-system-indigo/10 text-system-indigo">
                <GraduationCap size={20} />
              </span>

              <h3 className="mt-6 text-[20px] font-semibold leading-snug tracking-tight md:text-[23px]">
                {education.degree}
              </h3>

              <p className="mt-3 text-[14.5px] text-ink-muted dark:text-white/55">
                {education.school} · {education.period}
              </p>

              <p className="mt-5 text-[15px]">
                <span className="text-ink-faint">GPA </span>
                <span className="font-semibold">{education.gpa}</span>
              </p>

              <div className="mt-6">
                <h4 className="text-[12px] font-semibold uppercase tracking-[.08em] text-ink-faint">
                  Coursework
                </h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {education.coursework.map((course) => (
                    <Pill key={course}>{course}</Pill>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
