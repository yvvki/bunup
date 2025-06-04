import { exports } from './src/plugins/built-in/productivity/exports'

export default {
	outDir: 'dist',
	splitting: false,
	target: 'bun',
	format: ['esm', 'cjs'],
	entry: ['src/index.ts', 'src/plugins.ts', 'src/cli/index.ts'],
	dts: true,
	plugins: [exports()],
}
