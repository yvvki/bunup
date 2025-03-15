import {defineConfig} from 'bunup';

export default defineConfig({
    outdir: 'dist',
    entry: ['src/index.ts'],
    dts: true,
    minify: true,
    format: ['esm', 'cjs'],
});
