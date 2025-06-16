import { exports } from './src/plugins'

export default {
	outDir: 'dist',
	target: 'bun',
	format: ['esm'],
	entry: ['src/index.ts', 'src/plugins/index.ts', 'src/cli/index.ts'],
	dts: {
		entry: ['src/index.ts', 'src/plugins/index.ts'],
	},
	plugins: [exports()],
}
