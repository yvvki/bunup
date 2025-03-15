import {defineConfig} from 'tsup';

export default defineConfig({
    entry: ['fixtures/add.ts', 'fixtures/divide.ts'],
    minify: true,
    outDir: 'tsup-build',
    dts: true,
    treeshake: true,
    clean: true,
    format: ['esm', 'cjs'],
});
