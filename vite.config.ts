
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
    optimizeDeps: {
      include: ['@babel/runtime/helpers/extends', 'react-qr-scanner']
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    }
  };
});
