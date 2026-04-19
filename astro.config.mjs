import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  markdown: {
    syntaxHighlight: 'prism',
  },
  vite: {
    build: {
      cssMinify: true,
      minify: 'esbuild',
    },
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
});
