import { defineConfig } from '../src'

export default defineConfig({
	entry: ['fixtures/server/index.ts', 'fixtures/client/index.ts'],
	format: ['esm', 'cjs'],
	splitting: true,
	dts: {
		splitting: true,
	},
})
