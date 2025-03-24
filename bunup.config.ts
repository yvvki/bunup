import {defineConfig, type Options} from 'bunup';

const COMMON_OPTIONS: Partial<Options> = {
    outDir: 'build',
    minify: true,
    splitting: true,
};

export default defineConfig([
    {
        ...COMMON_OPTIONS,
        entry: ['./src/index.ts'],
        format: ['cjs', 'esm'],
        dts: true,
    },
    {
        ...COMMON_OPTIONS,
        name: 'cli',
        entry: ['./src/cli.ts'],
        format: ['esm'],
    },
    {
        ...COMMON_OPTIONS,
        name: 'dts-worker',
        format: ['cjs'],
        entry: {
            dtsWorker: './src/dts/worker.ts',
        },
    },
]);
