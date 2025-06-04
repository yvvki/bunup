import { exports } from './src/plugins/built-in/productivity/exports'

export default {
	outDir: 'dist',
	target: 'bun',
	format: ['esm'],
	entry: ['src/index.ts', 'src/plugins.ts', 'src/cli/index.ts'],
	dts: {
		entry: ['src/index.ts', 'src/plugins.ts'],
	},
	plugins: [exports()],
}
