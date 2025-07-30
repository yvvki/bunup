import { defineConfig } from '../src'
import { exports, unused } from '../src/plugins'

export default defineConfig({
	entry: ['fixtures/index.ts', 'fixtures/utils.ts'],
	format: ['esm', 'cjs'],
	splitting: true,
	plugins: [unused(), exports()],
})
