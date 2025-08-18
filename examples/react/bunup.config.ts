import { defineConfig } from 'bunup'
import { injectStyles } from 'bunup/plugins'

export default defineConfig({
	entry: ['src/index.tsx'],
	format: ['esm', 'cjs'],
	plugins: [injectStyles()],
})
