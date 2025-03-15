import {defineConfig} from 'bunup';

export default defineConfig({
    outdir: 'dist',
    entry: ['fixtures/add.ts', 'fixtures/divide.ts'],
    dts: true,
    minify: true,
    format: ['esm', 'cjs'],
});
