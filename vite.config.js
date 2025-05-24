import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    // force Vite to pre‐bundle the transformers client
    include: ['@huggingface/transformers'],
  },
  build: {
    rollupOptions: {
      // ensure nothing is accidentally externalized
      external: [],
    },
  },
});
