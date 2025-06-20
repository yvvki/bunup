import { defineConfig } from '../src'

export default defineConfig({
	entry: ['fixtures/index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
})
