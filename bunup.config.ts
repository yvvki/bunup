import { exports, unused } from './src/plugins'

export default {
	outDir: 'dist',
	target: 'bun',
	format: ['esm'],
	entry: ['src/index.ts', 'src/plugins.ts', 'src/cli/index.ts'],
	dts: {
		entry: ['src/index.ts', 'src/plugins.ts'],
		splitting: true,
	},
	plugins: [
		exports({
			exclude: ['src/cli/index.ts'],
		}),
		unused(),
	],
}
