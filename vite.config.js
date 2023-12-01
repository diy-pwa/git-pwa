import { defineConfig } from 'vite';
import { resolve } from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(
  {
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    plugins: [nodePolyfills()
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/promises.js'),
        name:  "webcontainer-fs-promises"
      }
    },
  })