import {defineConfig} from 'bunup';

export default defineConfig({
    entry: ['src/index.ts', 'src/some.ts'],
    format: ['esm', 'cjs'],
    minify: true,
    dts: true,
});
