import { describe, expect, it } from 'bun:test'
import {
	getResolvedBytecode,
	getResolvedDefine,
	getResolvedMinify,
	getResolvedSplitting,
} from '../../src/options'
import {
	cleanPath,
	ensureArray,
	formatFileSize,
	getDefaultDtsExtention,
	getDefaultOutputExtension,
	getPackageDeps,
	getShortFilePath,
	isDirectoryPath,
} from '../../src/utils'

describe('Utils', () => {
	describe('ensureArray', () => {
		it('wraps a single value in an array', () => {
			expect(ensureArray('test')).toEqual(['test'])
		})
		it('returns the array as is', () => {
			expect(ensureArray(['test1', 'test2'])).toEqual(['test1', 'test2'])
		})
	})

	describe('getDefaultJsOutputExtension', () => {
		it('returns .mjs for esm format', () => {
			expect(getDefaultOutputExtension('esm', undefined)).toBe('.mjs')
		})
		it('returns .cjs for cjs format with module type', () => {
			expect(getDefaultOutputExtension('cjs', 'module')).toBe('.cjs')
		})
		it('returns .js for cjs format with commonjs type', () => {
			expect(getDefaultOutputExtension('cjs', 'commonjs')).toBe('.js')
		})
		it('returns .global.js for iife format', () => {
			expect(getDefaultOutputExtension('iife', undefined)).toBe('.global.js')
		})
	})

	describe('getDefaultDtsExtention', () => {
		it('returns .d.mts for esm format without module type', () => {
			expect(getDefaultDtsExtention('esm', undefined, 'entry-point')).toBe(
				'.d.mts',
			)
		})
		it('returns .d.ts for esm format with module type', () => {
			expect(getDefaultDtsExtention('esm', 'module', 'entry-point')).toBe(
				'.d.ts',
			)
		})
		it('returns .d.cts for cjs format with module type', () => {
			expect(getDefaultDtsExtention('cjs', 'module', 'entry-point')).toBe(
				'.d.cts',
			)
		})
		it('returns .d.ts for cjs format with commonjs type', () => {
			expect(getDefaultDtsExtention('cjs', 'commonjs', 'entry-point')).toBe(
				'.d.ts',
			)
		})
		it('returns .d.ts for iife format', () => {
			expect(getDefaultDtsExtention('iife', undefined, 'entry-point')).toBe(
				'.global.d.ts',
			)
		})
		it('returns .d.ts for chunk files', () => {
			expect(getDefaultDtsExtention('esm', undefined, 'chunk')).toBe('.d.ts')
		})
	})

	describe('getPackageDeps', () => {
		it('returns dependencies and peerDependencies', () => {
			const packageJson = {
				dependencies: { dep1: '1.0.0' },
				peerDependencies: { peerDep1: '^2.0.0' },
			}
			expect(getPackageDeps(packageJson)).toEqual(['dep1', 'peerDep1'])
		})
		it('returns empty array for no dependencies', () => {
			expect(getPackageDeps(null)).toEqual([])
		})
	})

	describe('getResolvedSplitting', () => {
		it('returns true for esm format by default', () => {
			expect(getResolvedSplitting(undefined, 'esm')).toBe(true)
		})
		it('returns false for cjs format by default', () => {
			expect(getResolvedSplitting(undefined, 'cjs')).toBe(false)
		})
		it('respects explicit splitting value', () => {
			expect(getResolvedSplitting(true, 'cjs')).toBe(true)
		})
	})

	describe('formatFileSize', () => {
		it('formats file size in bytes', () => {
			expect(formatFileSize(500)).toBe('500 B')
		})
		it('formats file size in kilobytes', () => {
			expect(formatFileSize(1500)).toBe('1.46 KB')
		})
		it('formats file size in megabytes', () => {
			expect(formatFileSize(1048576)).toBe('1.00 MB')
		})
	})

	describe('getShortFilePath', () => {
		it('returns last 3 parts of the path', () => {
			expect(getShortFilePath('a/b/c/d/e.ts')).toBe('c/d/e.ts')
		})
		it('handles paths with less than 3 parts', () => {
			expect(getShortFilePath('a/b.ts')).toBe('a/b.ts')
		})
	})

	describe('getResolvedBytecode', () => {
		it('returns bytecode for cjs format', () => {
			expect(getResolvedBytecode(true, 'cjs')).toBe(true)
		})
		it('returns undefined for non-cjs formats', () => {
			expect(getResolvedBytecode(true, 'esm')).toBeUndefined()
		})
	})

	describe('getResolvedMinify', () => {
		it('returns all true when minify is true', () => {
			const result = getResolvedMinify({
				minify: true,
				entry: [],
				outDir: '',
				format: 'cjs',
			})
			expect(result).toEqual({
				whitespace: true,
				identifiers: true,
				syntax: true,
			})
		})

		it('uses specific minify options when provided', () => {
			const result = getResolvedMinify({
				minify: true,
				minifyWhitespace: false,
				minifyIdentifiers: true,
				minifySyntax: false,
				entry: [],
				outDir: '',
				format: 'cjs',
			})
			expect(result).toEqual({
				whitespace: false,
				identifiers: true,
				syntax: false,
			})
		})

		it('defaults to false when minify is undefined', () => {
			const result = getResolvedMinify({
				entry: [],
				outDir: '',
				format: 'cjs',
			})
			expect(result).toEqual({
				whitespace: false,
				identifiers: false,
				syntax: false,
			})
		})
	})

	describe('getResolvedDefine', () => {
		it('returns undefined when both define and env are undefined', () => {
			const result = getResolvedDefine(undefined, undefined)
			expect(result).toEqual({})
		})

		it('returns define values when only define is provided', () => {
			const define = { 'process.env.NODE_ENV': '"production"' }
			const result = getResolvedDefine(define, undefined)
			expect(result).toEqual({ 'process.env.NODE_ENV': '"production"' })
		})

		it('creates entries for process.env and import.meta.env when env object is provided', () => {
			const env = { API_KEY: 'abc123', DEBUG: 'true' }
			const result = getResolvedDefine(undefined, env)
			expect(result).toEqual({
				'process.env.API_KEY': '"abc123"',
				'import.meta.env.API_KEY': '"abc123"',
				'process.env.DEBUG': '"true"',
				'import.meta.env.DEBUG': '"true"',
			})
		})

		it('merges define and env values when both are provided', () => {
			const define = { VERSION: '"1.0.0"' }
			const env = { NODE_ENV: 'production' }
			const result = getResolvedDefine(define, env)
			expect(result).toEqual({
				VERSION: '"1.0.0"',
				'process.env.NODE_ENV': '"production"',
				'import.meta.env.NODE_ENV': '"production"',
			})
		})

		it('define values take precedence over env values', () => {
			const define = { 'process.env.NODE_ENV': '"development"' }
			const env = { NODE_ENV: 'production' }
			const result = getResolvedDefine(define, env)
			expect(result).toEqual({
				'process.env.NODE_ENV': '"development"',
				'import.meta.env.NODE_ENV': '"production"',
			})
		})
	})

	describe('cleanPath', () => {
		it('converts backslashes to forward slashes', () => {
			expect(cleanPath('path\\to\\file.js')).toBe('path/to/file.js')
		})

		it('strips Windows drive letters', () => {
			expect(cleanPath('C:/path/to/file.js')).toBe('path/to/file.js')
		})

		it('removes leading slashes', () => {
			expect(cleanPath('/path/to/file.js')).toBe('path/to/file.js')
		})

		it('handles already normalized paths', () => {
			expect(cleanPath('path/to/file.js')).toBe('path/to/file.js')
		})

		it('handles complex paths with multiple transformations', () => {
			expect(cleanPath('D:\\\\multiple\\//slashes//\\file.js')).toBe(
				'multiple/slashes/file.js',
			)
		})

		it('converts backslashes to forward slashes', () => {
			expect(cleanPath('path\\to\\file.js')).toBe('path/to/file.js')
		})

		it('keeps forward slashes unchanged', () => {
			expect(cleanPath('path/to/file.js')).toBe('path/to/file.js')
		})

		it('handles mixed slashes', () => {
			expect(cleanPath('path\\to/mixed\\slashes.js')).toBe(
				'path/to/mixed/slashes.js',
			)
		})

		it('handles path with no slashes', () => {
			expect(cleanPath('filename.js')).toBe('filename.js')
		})

		it('handles multiple consecutive backslashes', () => {
			expect(cleanPath('path\\\\to\\\\file.js')).toBe('path/to/file.js')
		})
	})

	describe('isDirectoryPath', () => {
		it('returns true for paths without extensions', () => {
			expect(isDirectoryPath('path/to/directory')).toBe(true)
		})

		it('returns false for paths with extensions', () => {
			expect(isDirectoryPath('path/to/file.js')).toBe(false)
		})

		it('returns true for single directory name', () => {
			expect(isDirectoryPath('directory')).toBe(true)
		})

		it('returns false for filename with extension', () => {
			expect(isDirectoryPath('file.txt')).toBe(false)
		})

		it('returns false for paths with multiple dots in filename', () => {
			expect(isDirectoryPath('path/to/file.min.js')).toBe(false)
		})

		it('returns true for paths ending with slash', () => {
			expect(isDirectoryPath('path/to/directory/')).toBe(true)
		})

		it('returns true for empty string', () => {
			expect(isDirectoryPath('')).toBe(true)
		})

		it('returns true for root path', () => {
			expect(isDirectoryPath('/')).toBe(true)
		})

		it('returns true for relative directory paths', () => {
			expect(isDirectoryPath('./directory')).toBe(true)
			expect(isDirectoryPath('../directory')).toBe(true)
		})

		it('returns false for hidden files with extensions', () => {
			expect(isDirectoryPath('.hidden.txt')).toBe(false)
		})

		it('returns true for hidden directories', () => {
			expect(isDirectoryPath('.hidden')).toBe(true)
		})
	})
})
