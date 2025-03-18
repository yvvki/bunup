import {defineConfig} from 'bunup';

export default defineConfig({
    outDir: 'build',
    entry: ['./src/index.ts', './src/cli.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    minify: true,
    splitting: true,
});
