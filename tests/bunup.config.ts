import {defineConfig} from 'bunup';

export default defineConfig({
    entry: ['fixtures/add.ts'],
    minify: true,
    dts: true,
    format: ['esm'],
});
