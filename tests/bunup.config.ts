import {defineConfig} from 'bunup';

export default defineConfig({
    entry: ['fixtures/add.ts', 'fixtures/divide.ts'],
    minify: true,
    format: ['esm', 'iife', 'cjs'],
});
