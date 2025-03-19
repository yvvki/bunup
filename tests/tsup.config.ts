import {defineConfig} from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/some.ts'],
    format: ['esm'],
    minify: true,
    splitting: true,
    clean: true,
    treeshake: true,
    dts: true,
});
