#!/usr/bin/env node
// Scaffold a blog post: npm run new-post -- "Post Title" [--series robotics-one-page] [--tags a,b] [--sheet /assets/img/posts/x/sheet.jpg]
// Writes src/content/posts/<slug>.md with frontmatter; auto-numbers within the series.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'posts');
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args.splice(i, 2)[1];
};
const series = opt('series', 'robotics-one-page');
const tags = opt('tags', '').split(',').map((t) => t.trim()).filter(Boolean);
const sheet = opt('sheet', '');
const title = args.join(' ').trim();
if (!title) {
  console.error('Usage: npm run new-post -- "Post Title" [--series key|none] [--tags a,b] [--sheet /path.jpg]');
  process.exit(1);
}

const slug = title.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-');
const file = join(dir, `${slug}.md`);
if (existsSync(file)) { console.error(`Exists: ${file}`); process.exit(1); }

let number = 0;
if (series !== 'none') {
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const src = readFileSync(join(dir, f), 'utf8');
    if (new RegExp(`^series:\\s*${series}\\s*$`, 'm').test(src)) {
      const n = Number(/^seriesNumber:\s*(\d+)/m.exec(src)?.[1] ?? 0);
      number = Math.max(number, n);
    }
  }
}

// ISO timestamp with local UTC offset, e.g. 2026-09-10T11:05:00+01:00
const d = new Date();
const off = -d.getTimezoneOffset();
const p = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');
const local = new Date(d.getTime() + off * 60000).toISOString().slice(0, 19);
const stamp = `${local}${off >= 0 ? '+' : '-'}${p(off / 60)}:${p(off % 60)}`;

const fm = [
  '---',
  `title: ${JSON.stringify(title)}`,
  ...(series !== 'none' ? [`series: ${series}`, `seriesNumber: ${number + 1}`] : []),
  'standfirst: ""',
  'excerpt: "TODO: one or two sentences for the index."',
  `tags: [${tags.join(', ')}]`,
  `created: ${stamp}`,
  `updated: ${stamp}`,
  'readingTime: 5 min',
  ...(sheet ? ['sheetImages:', `  - ${JSON.stringify(sheet)}`] : []),
  'draft: true',
  '---',
  '',
  'Write the intro here. Inline math: $x_k$. Display math:',
  '',
  '$$',
  'K = P H^T (H P H^T + R)^{-1}',
  '$$',
  '',
];
writeFileSync(file, fm.join('\n'));
console.log(`Created ${file}\nSet draft: false when it is ready to publish.`);
