import {defineConfig} from 'bunup';

export default defineConfig([
      {
            entry: ['src/index.ts'],
            format: ['esm', 'cjs'],
            minify: true,
            dts: {
                  resolve: true,
            },
            define: {
                  PACKAGE_NAME: '"bunup"',
                  PACKAGE_VERSION: '"1.0.0"',
            },
      },
      {
            entry: ['src/some.ts'],
            format: ['esm', 'cjs'],
            minify: true,
            dts: {
                  resolve: true,
            },
            define: {
                  PACKAGE_NAME: '"bunup"',
                  PACKAGE_VERSION: '"1.0.0"',
            },
      },
]);
