import {defineConfig} from 'bunup';

export default defineConfig([
    {
        name: 'monacopilot',
        entry: ['fixtures/add.ts'],
        minify: true,
        format: ['esm'],
        dts: true,
    },
    {
        name: 'monacopilot-browser',
        entry: ['fixtures/add.ts'],
        minify: true,
        format: ['cjs'],
        target: 'browser',
        dts: true,
    },
]);
