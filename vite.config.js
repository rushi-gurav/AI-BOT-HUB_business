import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      // Use the port from .env file, default to 5000
      port: parseInt(env.VITE_PORT, 10) || 5000,
      hmr: {
        port: parseInt(env.VITE_PORT, 10) || 5000,
      },
    },
    resolve: {
      // This prevents issues with multiple versions of React
      alias: {
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      },
    },
  };
});