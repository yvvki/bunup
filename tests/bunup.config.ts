import { defineConfig } from '../src'
import { report } from '../src/plugins/built-in'

export default defineConfig({
	entry: ['fixtures/index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
	plugins: [report()],
	splitting: false,
})
