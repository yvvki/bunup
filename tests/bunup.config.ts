import { defineConfig } from '../src'
import { removeNodeProtocol, report, shims } from '../src/plugins/built-in'

export default defineConfig({
    entry: ['fixtures/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    plugins: [removeNodeProtocol(), shims()],
    splitting: false,
})
