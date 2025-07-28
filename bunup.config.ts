import { defineConfig } from 'bunup'
import { exports, unused } from 'bunup/plugins'

export default defineConfig({
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
})
