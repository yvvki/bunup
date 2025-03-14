import {defineConfig} from 'bunup';

export default defineConfig({
    outdir: 'dist',
    entry: ['src/cli.ts'],
    minify: true,
    dts: true,
    format: ['cjs', 'esm'],
});
