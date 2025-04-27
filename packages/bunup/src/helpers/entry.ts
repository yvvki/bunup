import { basename, dirname, extname } from 'node:path'
import { isTypeScriptSourceCodeFile } from '../dts/utils'
import type { Entry } from '../options'

export type ProcessableEntry = {
	fullPath: string
	/**
	 * The relative path to the output directory.
	 *
	 * This is the path that will be used to name the output file.
	 *
	 * Examples:
	 * - "src/index.ts" → "index"
	 * - "src/plugins/index.ts" → "plugins/index"
	 * - etc.
	 */
	outputBasePath: string
}

export function getEntryNameOnly(entry: string): string {
	const filename = basename(entry)
	const extension = extname(filename)
	return extension ? filename.slice(0, -extension.length) : filename
}

export function normalizeEntryToProcessableEntries(
	entry: Entry,
): ProcessableEntry[] {
	if (typeof entry === 'string') {
		return [
			{
				fullPath: entry,
				outputBasePath: getEntryNameOnly(entry),
			},
		]
	}

	if (typeof entry === 'object' && !Array.isArray(entry)) {
		return Object.entries(entry).map(([name, path]) => ({
			fullPath: path as string,
			outputBasePath: name,
		}))
	}

	const result: ProcessableEntry[] = []
	const usedOutputPaths = new Set<string>()

	for (const path of entry) {
		const baseName = getEntryNameOnly(path)

		if (!usedOutputPaths.has(baseName)) {
			result.push({
				fullPath: path,
				outputBasePath: baseName,
			})
			usedOutputPaths.add(baseName)
			continue
		}

		const dir = dirname(path)
		const segments = dir.split('/').filter((s) => s !== '.' && s !== '')

		if (segments.length === 0) {
			let counter = 1
			let newName: string
			do {
				newName = `${baseName}_${counter++}`
			} while (usedOutputPaths.has(newName))

			result.push({
				fullPath: path,
				outputBasePath: newName,
			})
			usedOutputPaths.add(newName)
			continue
		}

		let found = false
		for (let i = 1; i <= segments.length && !found; i++) {
			const relevantSegments = segments.slice(-i)
			const newName = `${relevantSegments.join('/')}/${baseName}`

			if (!usedOutputPaths.has(newName)) {
				result.push({
					fullPath: path,
					outputBasePath: newName,
				})
				usedOutputPaths.add(newName)
				found = true
			}
		}

		if (!found) {
			let counter = 1
			let newName: string
			do {
				newName = `${segments.join('/')}/${baseName}_${counter++}`
			} while (usedOutputPaths.has(newName))

			result.push({
				fullPath: path,
				outputBasePath: newName,
			})
			usedOutputPaths.add(newName)
		}
	}

	return result
}

export function filterTypeScriptEntries(
	entries: ProcessableEntry[],
): ProcessableEntry[] {
	return entries.filter((entry) => isTypeScriptSourceCodeFile(entry.fullPath))
}

export function getEntryNamingFormat(
	outputBasePath: string,
	extension: string,
) {
	return `[dir]/${outputBasePath}${extension}`
}

export function getChunkNamingFormat(outputBasePath: string) {
	return `${outputBasePath}-[hash].[ext]`
}

export function getAssetNamingFormat(outputBasePath: string) {
	return `${outputBasePath}-[hash].[ext]`
}
