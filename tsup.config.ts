import {defineConfig} from 'tsup';

export default defineConfig({
    outDir: 'build',
    entry: ['src/index.ts', 'src/cli.ts'],
    target: 'es2021',
    minify: true,
    format: ['esm', 'cjs'],
    clean: true,
    treeshake: true,
    dts: {
        resolve: true,
        entry: './src/index.ts',
    },
});
