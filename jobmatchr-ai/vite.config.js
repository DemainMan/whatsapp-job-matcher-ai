import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const certPath = 'certs/cert.pem';
const keyPath = 'certs/key.pem';
const useHttps = fs.existsSync(certPath) && fs.existsSync(keyPath);

const allowedHosts = (process.env.ALLOWED_HOSTS || 'localhost,127.0.0.1,::1')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts,
    https: useHttps
      ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }
      : undefined,
    proxy: {
      '/api': {
        target: useHttps ? 'https://localhost:4000' : 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
