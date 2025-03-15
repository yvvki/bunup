import {defineConfig} from 'bunup';

export default defineConfig({
    entry: ['fixtures/add.ts', 'fixtures/divide.ts'],
    minify: true,
    dts: true,
    format: ['esm', 'cjs'],
});
