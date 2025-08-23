import { beforeEach, describe, expect, it } from 'bun:test'
import { exports } from '../../../src/plugins'
import type { BuildContext } from '../../../src/plugins/types'
import { cleanProjectDir, createProject, runBuild } from '../../utils'

describe('exports plugin', () => {
	beforeEach(() => {
		cleanProjectDir()
	})

	it('should add exports field to package.json for ESM format', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: 'src/index.ts',
			format: 'esm',
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data).toBeDefined()
		expect(result.packageJson.data.exports).toBeDefined()
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)
	})

	it('should add exports field to package.json for CJS format', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: 'src/index.ts',
			format: 'cjs',
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports).toBeDefined()
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].require).toContain(
			'.output/index.js',
		)
	})

	it('should handle both ESM and CJS formats in exports', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: 'src/index.ts',
			format: ['esm', 'cjs'],
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain(
			'.output/index.mjs',
		)
		expect(result.packageJson.data.exports['.'].require).toContain(
			'.output/index.js',
		)
	})

	it('should handle TypeScript declarations (dts)', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: 'src/index.ts',
			format: 'esm',
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['.'].import.types).toBeDefined()
		expect(result.packageJson.data.exports['.'].import.types).toContain(
			'.d.mts',
		)
		expect(result.packageJson.data.types).toBeDefined()
	})

	it('should set main, module, and types entry points in package.json', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: 'src/index.ts',
			format: ['esm', 'cjs'],
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.main).toBeDefined()
		expect(result.packageJson.data.module).toBeDefined()
		expect(result.packageJson.data.types).toBeDefined()
	})

	it('should handle subpath exports', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const main = "main";',
			'src/utils.ts': 'export const util = "util";',
		})

		const result = await runBuild({
			entry: ['src/index.ts', 'src/utils.ts'],
			format: 'esm',
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['./utils']).toBeDefined()
		expect(result.packageJson.data.exports['./utils'].import).toContain(
			'.output/utils.mjs',
		)
	})

	it('should add the outDir to the files field in package.json', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
				files: ['lib'],
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: 'src/index.ts',
			format: 'esm',
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.files).toContain('.output')
		expect(result.packageJson.data.files).toContain('lib')
	})

	it('should preserve existing package.json fields', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
				author: 'Test Author',
				license: 'MIT',
				repository: 'https://github.com/test/test',
				keywords: ['test', 'package'],
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: 'src/index.ts',
			format: 'esm',
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.name).toBe('test-package')
		expect(result.packageJson.data.author).toBe('Test Author')
		expect(result.packageJson.data.license).toBe('MIT')
		expect(result.packageJson.data.repository).toBe(
			'https://github.com/test/test',
		)
		expect(result.packageJson.data.keywords).toEqual(['test', 'package'])
	})

	it('should support custom exports through customExports option', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: 'src/index.ts',
			format: 'esm',
			plugins: [
				exports({
					customExports: () => ({
						'./custom': './custom/path.js',
						'./features': {
							import: './features/esm.mjs',
							require: './features/cjs.cjs',
						},
					}),
				}),
			],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['./custom']).toBe('./custom/path.js')
		expect(result.packageJson.data.exports['./features']).toBeDefined()
		expect(result.packageJson.data.exports['./features'].import).toBe(
			'./features/esm.mjs',
		)
		expect(result.packageJson.data.exports['./features'].require).toBe(
			'./features/cjs.cjs',
		)
	})

	it('should merge custom exports with generated exports', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
			'src/utils.ts': 'export const util = "util";',
		})

		const result = await runBuild({
			entry: ['src/index.ts', 'src/utils.ts'],
			format: 'esm',
			plugins: [
				exports({
					customExports: () => ({
						'./utils': {
							node: './utils-node.js',
						},
					}),
				}),
			],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['./utils'].import).toContain(
			'.output/utils.mjs',
		)
		expect(result.packageJson.data.exports['./utils'].node).toBe(
			'./utils-node.js',
		)
	})

	it('should exclude specified entry points', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
			'src/internal.ts': 'export const internal = "internal";',
		})

		const result = await runBuild({
			entry: ['src/index.ts', 'src/internal.ts'],
			format: 'esm',
			plugins: [
				exports({
					exclude: ['src/internal.ts'],
				}),
			],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['./internal']).toBeUndefined()
	})

	it('should support dynamic exclude function', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
			'src/internal.ts': 'export const internal = "internal";',
		})

		const result = await runBuild({
			entry: ['src/index.ts', 'src/internal.ts'],
			format: 'esm',
			plugins: [
				exports({
					exclude: (ctx: BuildContext) => {
						const entries = Array.isArray(ctx.options.entry)
							? ctx.options.entry
							: [ctx.options.entry]
						return entries.filter((entry) => entry.includes('internal'))
					},
				}),
			],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['./internal']).toBeUndefined()
	})

	it('should correctly handle format-specific types', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': `
				export const hello: string = "world";
				// Different functionality for ESM and CJS
			`,
		})

		const result = await runBuild({
			entry: 'src/index.ts',
			format: ['esm', 'cjs'],
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)

		if (typeof result.packageJson.data.exports['.'].import === 'object') {
			expect(result.packageJson.data.exports['.'].import.types).toBeDefined()
		}

		if (typeof result.packageJson.data.exports['.'].require === 'object') {
			expect(result.packageJson.data.exports['.'].require.types).toBeDefined()
		}
	})

	it('should handle nested directory structures correctly', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export * from "./components";',
			'src/components/index.ts': 'export * from "./Button";',
			'src/components/Button.ts': 'export const Button = () => "button";',
		})

		const result = await runBuild({
			entry: [
				'src/index.ts',
				'src/components/index.ts',
				'src/components/Button.ts',
			],
			format: 'esm',
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['./components']).toBeDefined()
		expect(result.packageJson.data.exports['./components/Button']).toBeDefined()
	})

	it('should add the default output directory to exports field', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: 'src/index.ts',
			format: 'esm',
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['.'].import).toContain('.output/')
		expect(result.packageJson.data.files).toContain('.output')
	})

	it('should correctly generate export keys for index files in subdirectories', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
			}),
			'src/index.ts': 'export const main = "main";',
			'src/features/index.ts': 'export const features = "features";',
		})

		const result = await runBuild({
			entry: ['src/index.ts', 'src/features/index.ts'],
			format: 'esm',
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['.']).toBeDefined()
		expect(result.packageJson.data.exports['./features']).toBeDefined()
		expect(result.packageJson.data.exports['./features/index']).toBeUndefined()
	})

	it('should handle TypeScript declaration files with different extensions correctly', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
				type: 'module',
			}),
			'src/index.ts': 'export const hello: string = "world";',
		})

		const result = await runBuild({
			entry: 'src/index.ts',
			format: 'esm',
			dts: true,
			plugins: [exports()],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['.']).toBeDefined()

		const typesPath = result.packageJson.data.exports['.'].import.types
		expect(typesPath).toBeDefined()
		expect(typesPath).toContain('.d.ts')
	})

	it('should properly maintain existing root exports when adding subpath exports', async () => {
		createProject({
			'package.json': JSON.stringify({
				name: 'test-package',
				version: '1.0.0',
				exports: {
					'.': {
						import: './existing/esm.js',
						require: './existing/cjs.js',
					},
					'./extra': './existing/extra.js',
				},
			}),
			'src/utils.ts': 'export const util = "util";',
		})

		const result = await runBuild({
			entry: ['src/utils.ts'],
			format: 'esm',
			plugins: [
				exports({
					customExports: (ctx) => ctx.meta.packageJson.data?.exports,
				}),
			],
		})

		expect(result.success).toBe(true)
		expect(result.packageJson.data.exports['.']).toEqual({
			import: './existing/esm.js',
			require: './existing/cjs.js',
		})
		expect(result.packageJson.data.exports['./extra']).toBe(
			'./existing/extra.js',
		)
		expect(result.packageJson.data.exports['./utils']).toBeDefined()
	})
})
