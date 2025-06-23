import { defineConfig } from '../src'
import { exports } from '../src/plugins/built-in/exports'

export default defineConfig({
	entry: ['fixtures/index.ts'],
	format: ['esm'],
	dts: true,
	plugins: [exports()],
})
