import {defineConfig} from 'tsup';

export default defineConfig({
    name: 'bunup',
    outDir: 'build',
    entry: ['./src/index.ts', './src/cli.ts'],
    format: ['cjs', 'esm'],
    dts: {
        entry: ['./src/index.ts'],
    },
    minify: true,
    splitting: true,
});
