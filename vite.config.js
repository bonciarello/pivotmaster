import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  base: './',
  plugins: [svelte()],
  server: {
    host: '0.0.0.0',
    port: 4599
  },
  preview: {
    host: '0.0.0.0',
    port: 4599
  }
});
