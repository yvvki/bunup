import {defineConfig} from 'bunup';

export default defineConfig({
      entry: ['src/index.ts', 'src/index.ts'],
      format: ['esm', 'cjs'],
      minify: true,
      dts: true,
});
