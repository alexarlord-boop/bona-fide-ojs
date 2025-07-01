import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/main.js',
      name: 'TrustScores',
      fileName: () => 'trust-scores.iife.js',
      formats: ['iife'],
    },
    outDir: 'public/build',
    rollupOptions: {
      external: [], // ❌ НЕ исключаем vue
    },
  },
  define: {
    'process.env': {}, // 🔧 устраняет ошибку "process is not defined"
  },
});
