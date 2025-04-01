import {defineConfig, type DefineConfigEntry} from 'bunup';

const COMMON_OPTIONS: Partial<DefineConfigEntry> = {
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
            entry: ['./src/cli.ts'],
            format: ['esm'],
      },
]);
