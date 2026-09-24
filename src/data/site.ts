/** Identity, links and series — single source of truth (was assets/js/config.js). */
export const SITE = {
  name: 'Mahmud Lawal',
  role: 'Robotics & AI Engineer',
  title: 'Mahmud Lawal — Robotics & AI Engineer',
  description:
    'Mahmud Lawal — Robotics & AI Engineer building end-to-end autonomous systems, computer-vision pipelines, and edge-deployed AI. Projects, writing, and contact.',
  email: 'mahmudlawal75@gmail.com',
  location: 'Abuja, Nigeria',
  links: {
    github: 'https://github.com/MHVVD',
    linkedin: 'https://www.linkedin.com/in/mahmud-lawal',
    email: 'mailto:mahmudlawal75@gmail.com',
  },
  ogImage: '/assets/img/mahmud.jpg',
} as const;

export interface Series {
  title: string;
  short: string;
  blurb: string;
}

export const SERIES: Record<string, Series> = {
  'robotics-one-page': {
    title: 'Robotics Concepts in One Page',
    short: 'Robotics Concepts',
    blurb:
      'One robotics idea per page — the intuition in prose, the mathematics on a printable sheet you can pin to a wall.',
  },
};

export const seriesLabel = (key?: string) =>
  (key && (SERIES[key]?.short ?? SERIES[key]?.title)) || key || '';

export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Dates are authored in WAT (+01:00); format in that zone so builds are deterministic. */
const TZ = 'Africa/Lagos';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const parts = (d: Date) => {
  const p = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'numeric', year: 'numeric', timeZone: TZ }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)!.value;
  return { day: get('day'), month: Number(get('month')) - 1, year: get('year') };
};
/** "10 Sep 2026" / "10 September 2026" */
export const fmtDate = (d: Date, month: 'short' | 'long' = 'short') => {
  const { day, month: m, year } = parts(d);
  return `${day} ${month === 'long' ? MONTHS[m] : MONTHS[m].slice(0, 3)} ${year}`;
};
/** "10 Sep 2026, 11:05 WAT" */
export const fmtDateTime = (d: Date) =>
  `${fmtDate(d)}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: TZ })} WAT`;
