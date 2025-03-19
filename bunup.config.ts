// @ts-nocheck

import {defineConfig} from 'bunup';

export default defineConfig([
    {
        name: 'bunup',
        outDir: 'build',
        entry: ['./src/index.ts'],
        format: ['cjs', 'esm'],
        dts: true,
        minify: true,
        splitting: true,
    },
    {
        name: 'bunup-cli',
        outDir: 'build',
        entry: ['./src/cli.ts'],
        format: ['esm'],
        minify: true,
        splitting: true,
    },
    {
        name: 'bunup-dts-worker',
        outDir: 'build',
        format: ['cjs'],
        entry: {
            dtsWorker: './src/dts-worker.ts',
        },
        minify: true,
        splitting: true,
    },
]);
