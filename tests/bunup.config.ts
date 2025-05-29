import { defineConfig } from '../src'
import { copy } from '../src/plugins/built-in'

export default defineConfig({
	entry: ['fixtures/index.ts'],
	format: ['esm'],
	dts: true,
	plugins: [copy(['fixtures/**/*.css'], 'dist/cool')],
	splitting: false,
})
