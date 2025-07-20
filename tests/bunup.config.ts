import { defineConfig } from '../src'
import { unused } from '../src/plugins'

export default defineConfig({
	entry: ['fixtures/index.ts'],
	format: ['esm', 'cjs'],
	splitting: true,
	dts: {
		splitting: true,
	},
	plugins: [unused()],
})
