// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://mhvvd.github.io',
  output: 'static',
  build: { format: 'directory' },
  markdown: {
    // Math is rendered to static HTML at build time by KaTeX (no client-side JS).
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: 'ignore' }]],
    }),
  },
});
