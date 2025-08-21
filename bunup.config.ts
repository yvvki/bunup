import { exports, unused } from './src/plugins'

export default {
	outDir: 'dist',
	name: 'bunup',
	target: 'bun',
	format: ['esm'],
	entry: ['src/index.ts', 'src/plugins.ts', 'src/cli/index.ts'],
	dts: {
		splitting: true,
	},
	plugins: [
		exports({
			exclude: ['src/cli/index.ts'],
		}),
		unused(),
	],
}
