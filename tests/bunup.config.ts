import {defineWorkspace} from 'bunup';

export default defineWorkspace([
      {
            name: 'test',
            root: 'src',
            config: {
                  entry: ['index.ts'],
                  format: ['esm', 'cjs'],
                  minify: true,
                  dts: true,
                  clean: true,
            },
      },
      {
            name: 'test2',
            root: 'src/utils',
            config: {
                  entry: ['numbers.ts'],
                  format: ['esm', 'cjs'],
                  minify: true,
                  dts: true,
                  clean: true,
            },
      },
]);
