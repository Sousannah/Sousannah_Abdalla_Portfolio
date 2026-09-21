/**
 * The five destinations in the dock. `keywords` feed the ask bar's router, so
 * adding a word here is all it takes to make a phrase land on a section.
 */
export const SECTIONS = [
  {
    id: 'me',
    label: 'Me',
    icon: 'user',
    accent: 'blue',
    title: 'About me',
    keywords: [
      'me', 'about', 'who', 'you', 'yourself', 'bio', 'background', 'story',
      'sousannah', 'hello', 'hi', 'intro', 'language', 'arabic', 'english',
      'leadership', 'mentor', 'teach',
    ],
  },
  {
    id: 'roadmap',
    label: 'Experience',
    icon: 'route',
    accent: 'indigo',
    title: 'The road so far',
    keywords: [
      'experience', 'work history', 'career', 'job', 'jobs', 'role', 'roles',
      'employment', 'company', 'companies', 'where', 'worked', 'working',
      'now', 'currently', 'current', 'cv', 'resume', 'timeline', 'roadmap',
      'healthplans', 'maxbit', 'zudu', 'fiverr', 'louisville', 'larri',
      'alamein', 'digital egypt', 'teaching', 'intern', 'internship',
    ],
  },
  {
    id: 'work',
    label: 'Work',
    icon: 'layers',
    accent: 'purple',
    title: 'Things I have shipped',
    keywords: [
      'work', 'project', 'projects', 'built', 'build', 'shipped', 'portfolio',
      'product', 'products', 'case study', 'odenta', 'viatryon', 'voice agent',
      'claim', 'ocr', 'arabic ocr', 'uav', 'drone', 'gesture', 'asl', 'sign',
      'fraud', 'fwa', 'macular', 'dental', 'try on', 'demo',
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: 'sparkles',
    accent: 'teal',
    title: 'What I work with',
    keywords: [
      'skill', 'skills', 'stack', 'tech', 'technology', 'technologies', 'tools',
      'language', 'framework', 'python', 'react', 'pytorch', 'node', 'llm',
      'rag', 'mern', 'docker', 'aws', 'know', 'good at', 'expertise',
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: 'mail',
    accent: 'green',
    title: "Let's talk",
    keywords: [
      'contact', 'email', 'reach', 'hire', 'hiring', 'available', 'availability',
      'talk', 'message', 'get in touch', 'call', 'phone', 'linkedin', 'github',
      'freelance', 'rate', 'opportunity', 'job offer', 'collaborate', 'work together',
    ],
  },
];

/** Research lives inside Me rather than the dock — five pills is the limit. */
export const RESEARCH_SECTION = {
  id: 'research',
  label: 'Research',
  icon: 'award',
  accent: 'orange',
  title: 'Published, and still teaching',
  keywords: [
    'research', 'paper', 'publication', 'published', 'ieee', 'icuas', 'arxiv',
    'education', 'degree', 'university', 'gpa', 'study', 'studied', 'academic',
  ],
};

export const ALL_SECTIONS = [...SECTIONS, RESEARCH_SECTION];

/** Prompts shown under the ask bar to suggest what it can do. */
export const SUGGESTIONS = [
  { text: 'What are you building right now?', section: 'roadmap' },
  { text: 'Show me Odenta', section: 'work' },
  { text: 'Are you available for hire?', section: 'contact' },
  { text: 'What models have you fine-tuned?', section: 'skills' },
];
