import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // force Vite to pre-bundle @huggingface/transformers into your worker bundle
    include: ['@huggingface/transformers'],
  },
  build: {
    rollupOptions: {
      // make sure Rollup doesn’t try to treat transformers as an external import
      external: [],
    },
  },
});
