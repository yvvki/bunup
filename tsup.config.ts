import {defineConfig} from 'tsup';

export default defineConfig({
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
    external: ['@stacksjs/dtsx'],
});
