import {defineConfig} from 'bunup';

export default defineConfig([
      {
            name: 'bunup',
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
            name: 'bunup-some',
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
