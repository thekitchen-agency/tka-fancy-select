import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'tka-fancy-select.js'),
      name: 'TKAFancySelect',
      // The proper extensions will be added
      fileName: 'tka-fancy-select',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {},
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'tka-fancy-select.css';
          return assetInfo.name;
        },
      },
    },
    minify: 'terser',
    sourcemap: true,
  },
});
