import { defineConfig } from '../src'
import { exports, injectStyles, report } from '../src/plugins/built-in'

export default defineConfig({
    entry: ['fixtures/index.ts'],
    format: ['esm'],
    dts: true,
    plugins: [report(), injectStyles(), exports()],
    splitting: false,
})
