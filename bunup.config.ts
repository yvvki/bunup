import {defineConfig} from 'bunup';

export default defineConfig({
    entry: ['src/index.ts', 'src/cli.ts'],
    format: ['esm', 'cjs', 'iife'],
    minify: true,
    splitting: true,
});
