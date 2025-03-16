import {defineConfig} from 'tsup';

export default defineConfig([
    {
        name: 'bunup',
        outDir: 'build',
        entry: ['./src/index.ts', './src/cli.ts'],
        minify: true,
        format: ['cjs', 'esm'],
        clean: true,
        dts: {
            resolve: true,
            entry: './src/index.ts',
        },
        treeshake: true,
        splitting: true,
    },
    {
        name: 'bunup-dts-worker',
        outDir: 'build',
        entry: {
            dtsWorker: './src/dts/worker.ts',
        },
        minify: true,
        clean: true,
        treeshake: true,
        splitting: true,
    },
]);
