import {defineConfig} from 'bunup';

const commonOptions = {
    outDir: 'build',
    minify: true,
    splitting: true,
};

export default defineConfig([
    {
        ...commonOptions,
        entry: ['./src/index.ts'],
        format: ['cjs', 'esm'],
        dts: true,
    },
    {
        ...commonOptions,
        name: 'cli',
        entry: ['./src/cli.ts'],
        format: ['esm'],
    },
    {
        ...commonOptions,
        name: 'dts-worker',
        format: ['cjs'],
        entry: {
            dtsWorker: './src/dts/worker.ts',
        },
    },
]);
