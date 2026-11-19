import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Normal builds use absolute paths ('/') so deep links like /product/body-wave load their assets.
// The hash-routed preview build (npm run build:preview) uses relative paths so it runs from any folder.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_ROUTER === 'hash' ? './' : '/',
});
