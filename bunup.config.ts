import {defineConfig} from 'bunup';

export default defineConfig({
    entry: ['src/index.ts', 'src/cli.ts'],
    format: ['esm', 'cjs'],
    minify: true,
    splitting: true,
    dts: true,
});
