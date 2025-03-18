import {defineConfig} from 'bunup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    minify: true,
    splitting: true,
    dts: true,
});
