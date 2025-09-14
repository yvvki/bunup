import { defineConfig } from '../src'
import { exports, unused } from '../src/plugins'

export default defineConfig({
	entry: ['fixtures/index.tsx'],
	format: ['esm'],
	splitting: true,
	plugins: [unused(), exports()],
})
