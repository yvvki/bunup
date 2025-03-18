// @ts-nocheck

import {defineConfig} from 'bunup';

export default defineConfig([
    {
        name: 'bunup',
        outDir: 'build',
        entry: ['./src/index.ts', './src/cli.ts'],

        format: ['cjs', 'esm'],
        dts: {
            entry: ['./src/index.ts'],
        },
        minify: true,
        splitting: true,
    },
    {
        name: 'bunup-dts-worker',
        outDir: 'build',
        entry: {
            dtsWorker: './src/dts/worker.ts',
        },
        minify: true,
        splitting: true,
    },
]);
