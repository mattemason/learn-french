import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // In development, `npm run dev:server` runs the API on :3000.
  server: { proxy: { '/api': 'http://localhost:3000' } },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
} as any);
