import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/ruilai/',  // GitHub Pages 子路径
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    // 将环境变量传递给客户端代码（仅在本地开发时使用）
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
