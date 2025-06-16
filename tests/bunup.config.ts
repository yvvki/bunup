import { defineConfig } from '../src'
import { exports } from '../src/plugins'

export default defineConfig({
	entry: ['fixtures/index.ts', 'fixtures/client/index.ts'],
	format: ['esm'],
	dts: true,
	plugins: [exports()],
})
