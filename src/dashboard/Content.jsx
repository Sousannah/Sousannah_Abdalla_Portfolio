import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  EyeOff,
  GripVertical,
  Layers,
  Plus,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import api, { mediaUrl } from '../lib/api.js';
import { useContent } from '../lib/content.jsx';
import { ACCENTS } from '../components/ui/Primitives.jsx';
import { Empty, Panel, Spinner } from './common.jsx';
import {
  AccentPicker,
  Area,
  EditorSheet,
  GalleryField,
  ImageField,
  Lines,
  SavedToast,
  Text,
  Toggle,
} from './editor.jsx';

const TABS = [
  { id: 'projects', label: 'Projects', icon: Layers },
  { id: 'experiences', label: 'Experience', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'profile', label: 'Profile', icon: User },
];

const BLANK_PROJECT = {
  name: '', category: '', year: '', tagline: '', description: '',
  outcomes: [], stack: [], accent: 'blue', featured: false,
  link: '', linkLabel: '', coverUrl: null, gallery: [], published: true,
};

const BLANK_EXPERIENCE = {
  company: '', role: '', period: '', location: '', current: false,
  accent: 'blue', summary: '', highlights: [], stack: [], published: true,
};

const BLANK_SKILL_GROUP = { name: '', icon: 'brain', accent: 'blue', skills: [], published: true };

/** A row in one of the lists, with the controls to move and open it. */
function Row({ item, title, meta, accent, badges = [], onOpen, onMove, isFirst, isLast }) {
  return (
    <li className="group flex items-center gap-3 border-b border-black/[.05] px-4 py-3
      last:border-0 dark:border-white/[.06]">
      <span className="flex flex-col gap-0.5">
        <button
          onClick={() => onMove(-1)}
          disabled={isFirst}
          aria-label="Move up"
          className="text-ink-faint transition-colors hover:text-ink disabled:opacity-20
            dark:hover:text-white"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={() => onMove(1)}
          disabled={isLast}
          aria-label="Move down"
          className="text-ink-faint transition-colors hover:text-ink disabled:opacity-20
            dark:hover:text-white"
        >
          <ChevronDown size={14} />
        </button>
      </span>

      <GripVertical size={14} className="hidden shrink-0 text-ink-faint/50 sm:block" />

      <span className={`h-9 w-1.5 shrink-0 rounded-full ${ACCENTS[accent]?.bg || ACCENTS.blue.bg}`} />

      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-2">
          <span className="truncate text-[14px] font-medium">{title || 'Untitled'}</span>
          {badges.map((badge) => (
            <span key={badge.label} className={`shrink-0 ${badge.className}`} title={badge.label}>
              {badge.icon}
            </span>
          ))}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] text-ink-faint">{meta}</span>
      </button>

      <button
        onClick={onOpen}
        className="shrink-0 rounded-pill px-3 py-1.5 text-[12.5px] font-medium text-accent
          opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
      >
        Edit
      </button>
    </li>
  );
}

export default function Content() {
  const { reload } = useContent();

  const [tab, setTab] = useState('projects');
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(null); // { kind, item, isNew }
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = useCallback(
    () => api.get('/content/all').then(setData).catch(() => setData(null)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const flash = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2200);
  };

  /** Save whatever is open, then refresh both the dashboard and the live site. */
  const save = async () => {
    if (!editing) return;
    setSaving(true);

    const { kind, item, isNew } = editing;
    const path = { project: 'projects', experience: 'experiences', skills: 'skill-groups' }[kind];

    try {
      if (kind === 'profile') {
        await api.put('/content/profile', item);
      } else if (isNew) {
        await api.post(`/content/${path}`, item);
      } else {
        await api.put(`/content/${path}/${item.id}`, item);
      }

      await load();
      await reload();
      setEditing(null);
      flash(isNew ? 'Added' : 'Saved');
    } catch (error) {
      flash(error.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const { kind, item } = editing;
    const path = { project: 'projects', experience: 'experiences', skills: 'skill-groups' }[kind];

    if (!window.confirm(`Delete "${item.name || item.company}"? This cannot be undone.`)) return;

    await api.delete(`/content/${path}/${item.id}`);
    await load();
    await reload();
    setEditing(null);
    flash('Deleted');
  };

  /** Move a row and persist the new order for the whole list. */
  const move = async (kind, list, index, direction) => {
    const next = [...list];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];

    const key = { project: 'projects', experience: 'experiences', skills: 'skillGroups' }[kind];
    setData((current) => ({ ...current, [key]: next }));

    const path = { project: 'projects', experience: 'experiences', skills: 'skill-groups' }[kind];
    await api.patch(`/content/${path}/reorder`, { ids: next.map((item) => item.id) });
    await reload();
  };

  if (!data) return <Spinner />;

  const patch = (changes) =>
    setEditing((current) => ({ ...current, item: { ...current.item, ...changes } }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">Content</h1>
          <p className="mt-1 text-[13.5px] text-ink-muted dark:text-white/50">
            Everything on the public site. Changes go live the moment you save.
          </p>
        </div>

        {tab !== 'profile' && (
          <button
            onClick={() =>
              setEditing({
                kind: tab === 'projects' ? 'project' : tab === 'experiences' ? 'experience' : 'skills',
                item:
                  tab === 'projects'
                    ? { ...BLANK_PROJECT }
                    : tab === 'experiences'
                      ? { ...BLANK_EXPERIENCE }
                      : { ...BLANK_SKILL_GROUP },
                isNew: true,
              })
            }
            className="btn-primary px-4 py-2 text-[13.5px]"
          >
            <Plus size={15} />
            {tab === 'projects' ? 'New project' : tab === 'experiences' ? 'New role' : 'New group'}
          </button>
        )}
      </header>

      <div className="inline-flex gap-0.5 rounded-pill bg-black/[.05] p-0.5 dark:bg-white/[.07]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-1.5 rounded-pill px-3.5 py-1.5 text-[12.5px]
              font-medium transition-colors
              ${tab === id
                ? 'bg-white text-ink shadow-sm dark:bg-white/15 dark:text-white'
                : 'text-ink-muted hover:text-ink dark:text-white/50 dark:hover:text-white'}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ------------------------------- Projects ----------------------------- */}
      {tab === 'projects' && (
        <Panel padded={false}>
          {data.projects.length === 0 ? (
            <Empty icon={Layers} title="No projects yet" body="Add your first one above." />
          ) : (
            <ul>
              {data.projects.map((project, index) => (
                <Row
                  key={project.id}
                  accent={project.accent}
                  title={project.name}
                  meta={[project.category, project.year, project.tagline].filter(Boolean).join(' · ')}
                  badges={[
                    project.featured && {
                      label: 'Featured',
                      icon: <Star size={12} className="fill-system-yellow text-system-yellow" />,
                      className: '',
                    },
                    !project.published && {
                      label: 'Hidden',
                      icon: <EyeOff size={12} className="text-ink-faint" />,
                      className: '',
                    },
                  ].filter(Boolean)}
                  isFirst={index === 0}
                  isLast={index === data.projects.length - 1}
                  onMove={(direction) => move('project', data.projects, index, direction)}
                  onOpen={() => setEditing({ kind: 'project', item: { ...project }, isNew: false })}
                />
              ))}
            </ul>
          )}
        </Panel>
      )}

      {/* ------------------------------ Experience ---------------------------- */}
      {tab === 'experiences' && (
        <Panel padded={false}>
          {data.experiences.length === 0 ? (
            <Empty icon={Briefcase} title="No roles yet" body="Add your first one above." />
          ) : (
            <ul>
              {data.experiences.map((experience, index) => (
                <Row
                  key={experience.id}
                  accent={experience.accent}
                  title={experience.role}
                  meta={[experience.company, experience.period, experience.location]
                    .filter(Boolean)
                    .join(' · ')}
                  badges={[
                    experience.current && {
                      label: 'Current',
                      icon: <span className="h-2 w-2 rounded-full bg-system-green" />,
                      className: 'inline-block',
                    },
                    !experience.published && {
                      label: 'Hidden',
                      icon: <EyeOff size={12} className="text-ink-faint" />,
                      className: '',
                    },
                  ].filter(Boolean)}
                  isFirst={index === 0}
                  isLast={index === data.experiences.length - 1}
                  onMove={(direction) => move('experience', data.experiences, index, direction)}
                  onOpen={() =>
                    setEditing({ kind: 'experience', item: { ...experience }, isNew: false })
                  }
                />
              ))}
            </ul>
          )}
          <p className="border-t border-black/[.06] px-4 py-3 text-[12px] text-ink-faint
            dark:border-white/[.08]">
            This order is the order of the stops on the roadmap.
          </p>
        </Panel>
      )}

      {/* -------------------------------- Skills ------------------------------ */}
      {tab === 'skills' && (
        <Panel padded={false}>
          <ul>
            {data.skillGroups.map((group, index) => (
              <Row
                key={group.id}
                accent={group.accent}
                title={group.name}
                meta={`${group.skills.length} skills · ${group.skills.slice(0, 4).join(', ')}${group.skills.length > 4 ? '…' : ''}`}
                badges={
                  !group.published
                    ? [{ label: 'Hidden', icon: <EyeOff size={12} className="text-ink-faint" />, className: '' }]
                    : []
                }
                isFirst={index === 0}
                isLast={index === data.skillGroups.length - 1}
                onMove={(direction) => move('skills', data.skillGroups, index, direction)}
                onOpen={() => setEditing({ kind: 'skills', item: { ...group }, isNew: false })}
              />
            ))}
          </ul>
        </Panel>
      )}

      {/* ------------------------------- Profile ------------------------------ */}
      {tab === 'profile' && (
        <Panel>
          <div className="flex items-center gap-4">
            <span className="h-16 w-16 overflow-hidden rounded-full bg-black/[.05] dark:bg-white/10">
              {data.profile.avatarUrl && (
                <img src={mediaUrl(data.profile.avatarUrl)} alt="" className="h-full w-full object-cover" />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold tracking-tight">{data.profile.name}</p>
              <p className="truncate text-[13px] text-ink-faint">
                {data.profile.title} · {data.profile.location}
              </p>
            </div>
            <button
              onClick={() => setEditing({ kind: 'profile', item: { ...data.profile }, isNew: false })}
              className="btn-secondary ml-auto px-4 py-2 text-[13px]"
            >
              Edit profile
            </button>
          </div>
        </Panel>
      )}

      {/* -------------------------------- Editor ------------------------------ */}
      <EditorSheet
        open={Boolean(editing)}
        saving={saving}
        title={
          !editing
            ? ''
            : editing.kind === 'profile'
              ? 'Profile'
              : editing.isNew
                ? `New ${editing.kind === 'skills' ? 'skill group' : editing.kind}`
                : editing.item.name || editing.item.role || 'Edit'
        }
        subtitle={editing?.kind === 'experience' ? editing.item.company : undefined}
        onClose={() => setEditing(null)}
        onSave={save}
        onDelete={editing && !editing.isNew && editing.kind !== 'profile' ? remove : undefined}
      >
        {editing?.kind === 'project' && (
          <ProjectForm item={editing.item} patch={patch} />
        )}
        {editing?.kind === 'experience' && (
          <ExperienceForm item={editing.item} patch={patch} />
        )}
        {editing?.kind === 'skills' && <SkillsForm item={editing.item} patch={patch} />}
        {editing?.kind === 'profile' && <ProfileForm item={editing.item} patch={patch} />}
      </EditorSheet>

      <SavedToast show={Boolean(toast)} message={toast} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Forms                                                                      */
/* -------------------------------------------------------------------------- */

function ProjectForm({ item, patch }) {
  return (
    <>
      <ImageField
        label="Cover image"
        hint="Shown on the card and at the top of the detail sheet. 1200×900 or larger works best."
        value={item.coverUrl}
        onChange={(url) => patch({ coverUrl: url })}
      />

      <Text label="Name" value={item.name} onChange={(e) => patch({ name: e.target.value })}
        placeholder="Odenta" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Text label="Category" value={item.category || ''} onChange={(e) => patch({ category: e.target.value })}
          placeholder="Healthcare AI" />
        <Text label="Year" value={item.year || ''} onChange={(e) => patch({ year: e.target.value })}
          placeholder="2025" />
      </div>

      <Text label="Tagline" value={item.tagline || ''} onChange={(e) => patch({ tagline: e.target.value })}
        hint="One line, shown on the card." placeholder="The official dental platform at AIU." />

      <Area label="Description" rows={6} value={item.description || ''}
        onChange={(e) => patch({ description: e.target.value })}
        hint="The full story, shown when someone opens the project." />

      <Lines label="Outcomes" value={item.outcomes} onChange={(v) => patch({ outcomes: v })}
        hint="What it actually delivered. One per line." />

      <Lines label="Tech stack" value={item.stack} onChange={(v) => patch({ stack: v })} rows={4} />

      <GalleryField label="Screenshots" value={item.gallery} onChange={(v) => patch({ gallery: v })} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Text label="Link (optional)" value={item.link || ''} onChange={(e) => patch({ link: e.target.value })}
          placeholder="https://…" />
        <Text label="Link label" value={item.linkLabel || ''} onChange={(e) => patch({ linkLabel: e.target.value })}
          placeholder="Read the paper" />
      </div>

      <AccentPicker value={item.accent} onChange={(v) => patch({ accent: v })} />

      <div className="space-y-2 rounded-apple bg-black/[.03] p-4 dark:bg-white/[.04]">
        <Toggle label="Featured" hint="Featured projects ride the big carousel at the top."
          checked={item.featured} onChange={(v) => patch({ featured: v })} />
        <Toggle label="Published" hint="Turn off to hide it from the site without deleting it."
          checked={item.published} onChange={(v) => patch({ published: v })} />
      </div>
    </>
  );
}

function ExperienceForm({ item, patch }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Text label="Company" value={item.company} onChange={(e) => patch({ company: e.target.value })}
          placeholder="Healthplans.AI" />
        <Text label="Role" value={item.role} onChange={(e) => patch({ role: e.target.value })}
          placeholder="AI Engineer & Technical Lead" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Text label="Period" value={item.period || ''} onChange={(e) => patch({ period: e.target.value })}
          placeholder="Sep 2025 — Present" />
        <Text label="Location" value={item.location || ''} onChange={(e) => patch({ location: e.target.value })}
          placeholder="USA · Remote" />
      </div>

      <Area label="Summary" rows={3} value={item.summary || ''}
        onChange={(e) => patch({ summary: e.target.value })}
        hint="One or two lines, shown on the roadmap card before it is expanded." />

      <Lines label="Highlights" rows={6} value={item.highlights}
        onChange={(v) => patch({ highlights: v })}
        hint="The detail behind the role. One bullet per line." />

      <Lines label="Tech stack" rows={3} value={item.stack} onChange={(v) => patch({ stack: v })} />

      <AccentPicker value={item.accent} onChange={(v) => patch({ accent: v })} />

      <div className="space-y-2 rounded-apple bg-black/[.03] p-4 dark:bg-white/[.04]">
        <Toggle label="Current role" hint="Shows a live dot on the roadmap marker."
          checked={item.current} onChange={(v) => patch({ current: v })} />
        <Toggle label="Published" checked={item.published} onChange={(v) => patch({ published: v })} />
      </div>
    </>
  );
}

const ICON_CHOICES = ['brain', 'mic', 'layers', 'cloud', 'sparkles'];

function SkillsForm({ item, patch }) {
  return (
    <>
      <Text label="Group name" value={item.name} onChange={(e) => patch({ name: e.target.value })}
        placeholder="AI & Machine Learning" />

      <div>
        <span className="mb-1.5 block text-[12.5px] font-medium text-ink-soft dark:text-white/65">
          Icon
        </span>
        <div className="flex flex-wrap gap-2">
          {ICON_CHOICES.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => patch({ icon })}
              className={`rounded-pill border px-3 py-1.5 text-[12.5px] capitalize transition-colors
                ${item.icon === icon
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'hairline text-ink-muted hover:text-ink dark:text-white/55'}`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <Lines label="Skills" rows={10} value={item.skills} onChange={(v) => patch({ skills: v })}
        hint="One per line. These also feed the search bar on the site." />

      <AccentPicker value={item.accent} onChange={(v) => patch({ accent: v })} />
      <Toggle label="Published" checked={item.published} onChange={(v) => patch({ published: v })} />
    </>
  );
}

function ProfileForm({ item, patch }) {
  const setStat = (index, key, value) => {
    const stats = [...(item.stats || [])];
    stats[index] = { ...stats[index], [key]: value };
    patch({ stats });
  };

  return (
    <>
      <ImageField
        label="Your photo"
        aspect="aspect-square max-w-[200px]"
        hint="Shown large on the landing page and small in the header. A square crop works best."
        value={item.avatarUrl}
        onChange={(url) => patch({ avatarUrl: url })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Text label="Full name" value={item.name} onChange={(e) => patch({ name: e.target.value })} />
        <Text label="First name" value={item.firstName || ''}
          onChange={(e) => patch({ firstName: e.target.value })}
          hint="Used in the greeting and the big background word." />
      </div>

      <Text label="Title" value={item.title || ''} onChange={(e) => patch({ title: e.target.value })}
        placeholder="AI Engineer" />

      <Lines label="Rotating roles" rows={4} value={item.roles} onChange={(v) => patch({ roles: v })}
        hint="These cycle in the big headline on the landing page." />

      <Text label="Greeting" value={item.greeting || ''} onChange={(e) => patch({ greeting: e.target.value })}
        placeholder="Hey, I'm Sousannah" />

      <Text label="Tagline" value={item.tagline || ''} onChange={(e) => patch({ tagline: e.target.value })}
        hint="The headline on the About view." />

      <Area label="Intro" rows={4} value={item.intro || ''} onChange={(e) => patch({ intro: e.target.value })} />

      <Lines label="About paragraphs" rows={8} value={item.about} onChange={(v) => patch({ about: v })}
        hint="One paragraph per line." />

      <div>
        <span className="mb-2 block text-[12.5px] font-medium text-ink-soft dark:text-white/65">
          Headline stats
        </span>
        <div className="space-y-2">
          {(item.stats || []).map((stat, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={stat.value || ''}
                onChange={(e) => setStat(index, 'value', e.target.value)}
                placeholder="9,000+"
                className="field w-28 py-2 text-[13.5px]"
              />
              <input
                value={stat.label || ''}
                onChange={(e) => setStat(index, 'label', e.target.value)}
                placeholder="Patient records on Odenta"
                className="field flex-1 py-2 text-[13.5px]"
              />
              <button
                onClick={() => patch({ stats: item.stats.filter((_, i) => i !== index) })}
                aria-label="Remove stat"
                className="shrink-0 rounded-lg px-2 text-ink-faint transition-colors hover:text-system-red"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => patch({ stats: [...(item.stats || []), { value: '', label: '' }] })}
            className="text-[12.5px] font-medium text-accent"
          >
            + Add a stat
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Text label="Email" type="email" value={item.email || ''}
          onChange={(e) => patch({ email: e.target.value })} />
        <Text label="Location" value={item.location || ''}
          onChange={(e) => patch({ location: e.target.value })} />
        <Text label="Phone" value={item.phone || ''} onChange={(e) => patch({ phone: e.target.value })} />
        <Text label="Phone link" value={item.phoneHref || ''}
          onChange={(e) => patch({ phoneHref: e.target.value })} hint="Digits only, e.g. +201276902211" />
        <Text label="WhatsApp number" value={item.whatsapp || ''}
          onChange={(e) => patch({ whatsapp: e.target.value })}
          hint="Country code first, digits only, e.g. 201276902211. Leave empty to hide the WhatsApp button." />
        <Text label="LinkedIn" value={item.linkedin || ''}
          onChange={(e) => patch({ linkedin: e.target.value })} />
        <Text label="GitHub" value={item.github || ''} onChange={(e) => patch({ github: e.target.value })} />
      </div>

      <Text label="CV file path" value={item.resumeUrl || ''}
        onChange={(e) => patch({ resumeUrl: e.target.value })}
        hint="Upload a new PDF below, or point at a file in the site's public folder." />

      <ImageField
        label="Replace the CV (PDF)"
        aspect="aspect-[3/1]"
        value={null}
        onChange={(url) => patch({ resumeUrl: url })}
      />

      <div className="space-y-2 rounded-apple bg-black/[.03] p-4 dark:bg-white/[.04]">
        <Toggle label="Available for work" hint="Shows the green pill on the landing page."
          checked={item.available} onChange={(v) => patch({ available: v })} />
        <Text label="Availability note" value={item.availabilityNote || ''}
          onChange={(e) => patch({ availabilityNote: e.target.value })} />
      </div>
    </>
  );
}
