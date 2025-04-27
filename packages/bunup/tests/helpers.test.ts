import { describe, expect, it } from 'bun:test'
import {
	getEntryNameOnly,
	normalizeEntryToProcessableEntries,
} from '../src/helpers/entry'

describe('Helpers', () => {
	it('normalizes string entry', () => {
		const result = normalizeEntryToProcessableEntries('src/index.ts')
		expect(result).toEqual([
			{ fullPath: 'src/index.ts', outputBasePath: 'index' },
		])
	})

	it('normalizes array entry', () => {
		const result = normalizeEntryToProcessableEntries([
			'src/index.ts',
			'src/utils.ts',
		])
		expect(result).toEqual([
			{ fullPath: 'src/index.ts', outputBasePath: 'index' },
			{ fullPath: 'src/utils.ts', outputBasePath: 'utils' },
		])
	})

	it('normalizes object entry', () => {
		const result = normalizeEntryToProcessableEntries({
			main: 'src/index.ts',
		})
		expect(result).toEqual([
			{ fullPath: 'src/index.ts', outputBasePath: 'main' },
		])
	})

	it('handles name conflicts in array entries', () => {
		const result = normalizeEntryToProcessableEntries([
			'src/index.ts',
			'lib/index.ts',
		])
		expect(result.length).toBe(2)
		expect(result[0].outputBasePath).toBe('index')
		expect(result[1].outputBasePath).toBe('lib/index')
	})

	it('getEntryNameOnly extracts name', () => {
		expect(getEntryNameOnly('src/index.ts')).toBe('index')
	})

	it('handles empty array', () => {
		const result = normalizeEntryToProcessableEntries([])
		expect(result).toEqual([])
	})

	it('handles empty object', () => {
		const result = normalizeEntryToProcessableEntries({})
		expect(result).toEqual([])
	})

	it('handles entries without file extensions', () => {
		const result = normalizeEntryToProcessableEntries('src/README')
		expect(result).toEqual([
			{ fullPath: 'src/README', outputBasePath: 'README' },
		])
	})

	it('handles deep nested paths', () => {
		const result = normalizeEntryToProcessableEntries(
			'src/components/ui/Button.ts',
		)
		expect(result).toEqual([
			{
				fullPath: 'src/components/ui/Button.ts',
				outputBasePath: 'Button',
			},
		])
	})

	it('handles multiple name conflicts with complex resolution', () => {
		const result = normalizeEntryToProcessableEntries([
			'src/components/Button.ts',
			'src/ui/Button.ts',
			'lib/components/Button.ts',
		])

		expect(result.length).toBe(3)
		const outputPaths = result.map((r) => r.outputBasePath)

		const uniquePaths = new Set(outputPaths)
		expect(uniquePaths.size).toBe(3)

		expect(outputPaths.some((p) => p.includes('components/Button'))).toBe(
			true,
		)
		expect(outputPaths.some((p) => p.includes('ui/Button'))).toBe(true)
		expect(outputPaths.some((p) => p.includes('Button'))).toBe(true)
	})

	it('handles mix of object and array entry types', () => {
		const result = normalizeEntryToProcessableEntries({
			app: 'src/index.ts',
			utils: 'src/utils/index.ts',
			'components/button': 'src/components/Button.ts',
		})

		expect(result).toEqual([
			{ fullPath: 'src/index.ts', outputBasePath: 'app' },
			{
				fullPath: 'src/utils/index.ts',
				outputBasePath: 'utils',
			},
			{
				fullPath: 'src/components/Button.ts',
				outputBasePath: 'components/button',
			},
		])
	})
})
