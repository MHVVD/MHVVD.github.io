import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    series: z.string().optional(),
    seriesNumber: z.number().int().optional(),
    standfirst: z.string().optional(),
    excerpt: z.string(),
    tags: z.array(z.string()).default([]),
    created: z.coerce.date(),
    updated: z.coerce.date().optional(),
    readingTime: z.string().optional(),
    /** Public paths of the technical-sheet images shown under the prose. */
    sheetImages: z.array(z.string()).default([]),
    /** Optional printable HTML version of the sheet. */
    sheetHtml: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
