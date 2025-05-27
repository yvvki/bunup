import { defineConfig } from '../src'
import { copy, report } from '../src/plugins/built-in'

export default defineConfig({
	entry: ['fixtures/index.ts'],
	format: ['esm'],
	dts: true,
	plugins: [report(), copy(['package.json'])],
	splitting: false,
})
