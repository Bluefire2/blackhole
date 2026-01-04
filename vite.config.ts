import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  // Root for blackhole.kyrylo.lol
  base: '/',
});


