import { defineConfig } from '../src'
import { copy, exports } from '../src/plugins/built-in'

export default defineConfig({
	entry: ['fixtures/index.ts', 'fixtures/client/index.ts'],
	format: ['esm'],
	dts: true,
	plugins: [exports()],
})
