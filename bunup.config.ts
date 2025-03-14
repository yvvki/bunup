import {defineConfig} from 'bunup';

export default defineConfig({
    outdir: 'dist',
    entry: ['index.ts'],
    minify: true,
    dts: true,
    format: ['cjs', 'esm'],
});
