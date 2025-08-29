import { beforeEach, describe, expect, it } from 'bun:test'
import {
	cleanProjectDir,
	createProject,
	findFile,
	runBuild,
	validateBuildFiles,
} from '../utils'

describe('Format Types and Output Extensions', () => {
	beforeEach(() => {
		cleanProjectDir()
		createProject({ 'src/index.ts': 'export const x = 1;' })
	})

	describe('Basic Format Options', () => {
		it('should generate .mjs for ESM format by default', async () => {
			const result = await runBuild({
				entry: 'src/index.ts',
				format: 'esm',
			})

			expect(result.success).toBe(true)
			expect(
				validateBuildFiles(result, {
					expectedFiles: ['index.mjs'],
				}),
			).toBe(true)
		})

		it('should generate .js for CJS format by default', async () => {
			const result = await runBuild({
				entry: 'src/index.ts',
				format: 'cjs',
			})

			expect(result.success).toBe(true)
			expect(
				validateBuildFiles(result, {
					expectedFiles: ['index.js'],
				}),
			).toBe(true)
		})

		it('should generate .global.js for IIFE format', async () => {
			const result = await runBuild({
				entry: 'src/index.ts',
				format: ['iife'],
			})

			expect(result.success).toBe(true)
			expect(
				validateBuildFiles(result, {
					expectedFiles: ['index.global.js'],
				}),
			).toBe(true)
		})

		it('should correctly generate files for all formats simultaneously', async () => {
			const result = await runBuild({
				entry: 'src/index.ts',
				format: ['esm', 'cjs', 'iife'],
			})

			expect(result.success).toBe(true)
			expect(
				validateBuildFiles(result, {
					expectedFiles: ['index.mjs', 'index.js', 'index.global.js'],
				}),
			).toBe(true)
		})
	})

	describe('Package Type Impact on Extensions', () => {
		it("should generate .js for ESM format with 'type: module' in package.json", async () => {
			createProject({
				'src/index.ts': 'export const x = 1;',
				'package.json': `{"type": "module"}`,
			})

			const result = await runBuild({
				entry: 'src/index.ts',
				format: 'esm',
			})

			expect(result.success).toBe(true)
			expect(
				validateBuildFiles(result, {
					expectedFiles: ['index.js'],
				}),
			).toBe(true)
		})

		it("should generate .cjs for CJS format with 'type: module' in package.json", async () => {
			createProject({
				'src/index.ts': 'export const x = 1;',
				'package.json': `{"type": "module"}`,
			})

			const result = await runBuild({
				entry: 'src/index.ts',
				format: 'cjs',
			})

			expect(result.success).toBe(true)
			expect(
				validateBuildFiles(result, {
					expectedFiles: ['index.cjs'],
				}),
			).toBe(true)
		})

		it("should generate correct extensions for all formats with 'type: module'", async () => {
			createProject({
				'src/index.ts': 'export const x = 1;',
				'package.json': `{"type": "module"}`,
			})

			const result = await runBuild({
				entry: 'src/index.ts',
				format: ['esm', 'cjs', 'iife'],
			})

			expect(result.success).toBe(true)
			expect(
				validateBuildFiles(result, {
					expectedFiles: ['index.js', 'index.cjs', 'index.global.js'],
				}),
			).toBe(true)
		})

		it('should generate correct extensions for IIFE format without package type', async () => {
			createProject({
				'src/index.ts': 'export const x = 1;',
				'package.json': `{"name": "test-package"}`,
			})

			const result = await runBuild({
				entry: 'src/index.ts',
				format: ['iife'],
				dts: true,
			})

			expect(result.success).toBe(true)
			expect(
				validateBuildFiles(result, {
					expectedFiles: ['index.global.js', 'index.global.d.ts'],
				}),
			).toBe(true)
		})

		it('should generate correct extensions for IIFE format with package type module', async () => {
			createProject({
				'src/index.ts': 'export const x = 1;',
				'package.json': `{"type": "module"}`,
			})

			const result = await runBuild({
				entry: 'src/index.ts',
				format: ['iife'],
				dts: true,
			})

			expect(result.success).toBe(true)
			expect(
				validateBuildFiles(result, {
					expectedFiles: ['index.global.js', 'index.global.d.ts'],
				}),
			).toBe(true)
		})
	})

	describe('TypeScript Declaration Extensions', () => {
		it('should generate correct declaration files for each format by default', async () => {
			const result = await runBuild({
				entry: 'src/index.ts',
				format: ['esm', 'cjs', 'iife'],
				dts: true,
			})

			expect(result.success).toBe(true)
			expect(
				validateBuildFiles(result, {
					expectedFiles: [
						'index.mjs',
						'index.d.mts',
						'index.js',
						'index.d.ts',
						'index.global.js',
					],
				}),
			).toBe(true)
		})

		it("should generate correct declaration files with 'type: module' in package.json", async () => {
			createProject({
				'src/index.ts': 'export const x = 1;',
				'package.json': `{"type": "module"}`,
			})

			const result = await runBuild({
				entry: 'src/index.ts',
				format: ['esm', 'cjs', 'iife'],
				dts: true,
			})

			expect(result.success).toBe(true)
			expect(
				validateBuildFiles(result, {
					expectedFiles: [
						'index.js',
						'index.d.ts',
						'index.cjs',
						'index.d.cts',
						'index.global.js',
						'index.global.d.ts',
					],
				}),
			).toBe(true)
		})
	})
})

describe('Complex Format Scenarios', () => {
	beforeEach(() => {
		cleanProjectDir()
	})

	it('should handle all file extensions with correct output formats', async () => {
		createProject({
			'package.json': `{"dependencies": {"react": "19.0.0"}}`,
			'src/js-file.js': 'export const jsVar = 1;',
			'src/jsx-file.jsx': 'export const jsxVar = () => <div>JSX</div>;',
			'src/ts-file.ts': 'export const tsVar: number = 2;',
			'src/tsx-file.tsx':
				'export const tsxComponent = (): JSX.Element => <div>TSX</div>;',
			'src/mjs-file.mjs': 'export const mjsVar = 3;',
			'src/cjs-file.cjs': 'exports.cjsVar = 4;',
			'src/mts-file.mts': 'export const mtsVar: number = 5;',
			'src/cts-file.cts': 'export const ctsVar: number = 6;',
		})

		const result = await runBuild({
			entry: [
				'src/js-file.js',
				'src/jsx-file.jsx',
				'src/ts-file.ts',
				'src/tsx-file.tsx',
				'src/mjs-file.mjs',
				'src/cjs-file.cjs',
				'src/mts-file.mts',
				'src/cts-file.cts',
			],
			format: ['esm', 'cjs'],
			dts: true,
		})

		expect(result.success).toBe(true)
		expect(
			validateBuildFiles(result, {
				expectedFiles: [
					'js-file.mjs',
					'jsx-file.mjs',
					'ts-file.mjs',
					'tsx-file.mjs',
					'mjs-file.mjs',
					'cjs-file.mjs',
					'mts-file.mjs',
					'cts-file.mjs',

					'js-file.js',
					'jsx-file.js',
					'ts-file.js',
					'tsx-file.js',
					'mjs-file.js',
					'cjs-file.js',
					'mts-file.js',
					'cts-file.js',

					'ts-file.d.ts',
					'tsx-file.d.ts',
					'mts-file.d.ts',
					'cts-file.d.ts',
					'ts-file.d.mts',
					'tsx-file.d.mts',
					'mts-file.d.mts',
					'cts-file.d.mts',
				],
			}),
		).toBe(true)
	})

	it('should allow format-specific configurations through multiple build configs', async () => {
		createProject({
			'src/index.ts': 'export const x = 1;',
			'src/lib.ts': "export const lib = 'library';",
		})

		const esmResult = await runBuild({
			entry: 'src/index.ts',
			format: 'esm',
			dts: true,
			banner: '// ESM Build',
		})

		const cjsResult = await runBuild({
			entry: ['src/lib.ts'],
			format: 'cjs',
			dts: true,
			banner: '// CJS Build',
			clean: false,
		})

		expect(esmResult.success).toBe(true)
		expect(
			validateBuildFiles(esmResult, {
				expectedFiles: ['index.mjs', 'index.d.mts'],
			}),
		).toBe(true)

		const esmFile = findFile(esmResult, 'index', '.mjs')
		expect(esmFile?.content).toContain('// ESM Build')

		expect(cjsResult.success).toBe(true)
		expect(
			validateBuildFiles(cjsResult, {
				expectedFiles: ['lib.js', 'lib.d.ts', 'index.mjs', 'index.d.mts'],
			}),
		).toBe(true)

		const cjsFile = findFile(cjsResult, 'lib', '.js')
		expect(cjsFile?.content).toContain('// CJS Build')
	})
})
