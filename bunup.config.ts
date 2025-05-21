import { exports } from './src/plugins/built-in/productivity/exports'

const COMMON_OPTIONS = {
    outDir: 'dist',
    splitting: false,
    target: 'bun',
}

export default [
    {
        ...COMMON_OPTIONS,
        format: ['esm', 'cjs'],
        entry: {
            index: 'src/index.ts',
            plugins: 'src/plugins/built-in/index.ts',
        },
        dts: true,
        plugins: [exports()],
    },
    {
        ...COMMON_OPTIONS,
        entry: { cli: 'src/cli/index.ts' },
        format: ['esm'],
    },
]
