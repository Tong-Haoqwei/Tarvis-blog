import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    excerpt: z.string().optional(),
    issueNumber: z.number().optional(),
  }),
});

const picks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/picks' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    source: z.string().url(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
    summary: z.string(),
  }),
});

export const collections = { posts, picks };
