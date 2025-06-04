import { exports } from './src/plugins/built-in/productivity/exports'

export default {
	outDir: 'dist',
	target: 'bun',
	format: ['esm'],
	splitting: false,
	entry: ['src/index.ts', 'src/plugins.ts', 'src/cli/index.ts'],
	dts: {
		entry: ['src/index.ts', 'src/plugins.ts'],
		splitting: true,
	},
	plugins: [exports()],
}
