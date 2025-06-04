import { JS_DTS_RE } from '../../../constants/re'
import { logger } from '../../../logger'
import type { Format } from '../../../options'
import { cleanPath, removeExtension } from '../../../utils'
import type { BuildOutputFile, BunupPlugin } from '../../types'

type ExportField = 'require' | 'import' | 'types'
type EntryPoint = 'main' | 'module' | 'types'
type ExportsField = Record<string, Record<ExportField, string>>

interface ExportsPluginOptions {
	/**
	 * Additional export fields to preserve alongside generated exports
	 */
	extraExports?: Record<string, string | Record<string, string>>
}

/**
 * A plugin that generates the exports field in the package.json file automatically.
 */
export function exports(options: ExportsPluginOptions = {}): BunupPlugin {
	return {
		type: 'bunup',
		name: 'exports',
		hooks: {
			onBuildDone: async ({ output, options: buildOptions, meta }) => {
				if (!meta.packageJson.path || !meta.packageJson.data) {
					return
				}

				try {
					const { exportsField, entryPoints } = generateExportsFields(
						output.files,
					)

					const files = Array.isArray(meta.packageJson.data.files)
						? [
								...new Set([
									...meta.packageJson.data.files,
									buildOptions.outDir,
								]),
							]
						: [buildOptions.outDir]

					// Start with generated exports instead of existing ones
					const mergedExports: Record<string, string | Record<string, string>> =
						{ ...exportsField }

					// Add extra exports if provided
					if (options.extraExports) {
						for (const [key, value] of Object.entries(options.extraExports)) {
							if (typeof value === 'string') {
								// Simple string export
								mergedExports[key] = value
							} else {
								// Complex export conditions - merge with existing generated exports for the same key
								const existingExport = mergedExports[key]
								if (
									typeof existingExport === 'object' &&
									existingExport !== null
								) {
									mergedExports[key] = {
										...existingExport,
										...value,
									}
								} else {
									mergedExports[key] = value
								}
							}
						}
					}

					const newPackageJson: Record<string, unknown> = {
						name: meta.packageJson.data.name,
						description: meta.packageJson.data.description,
						version: meta.packageJson.data.version,
						type: meta.packageJson.data.type,
						private: meta.packageJson.data.private,
						files,
						...entryPoints,
						exports: mergedExports,
					}

					// Preserve other fields from original package.json
					for (const key in meta.packageJson.data) {
						if (
							Object.prototype.hasOwnProperty.call(
								meta.packageJson.data,
								key,
							) &&
							!Object.prototype.hasOwnProperty.call(newPackageJson, key)
						) {
							newPackageJson[key] =
								meta.packageJson.data[key as keyof typeof meta.packageJson.data]
						}
					}

					await Bun.write(
						meta.packageJson.path,
						JSON.stringify(newPackageJson, null, 2),
					)

					logger.cli('Updated package.json with exports')
				} catch {
					logger.error('Failed to update package.json')
				}
			},
		},
	}
}

function generateExportsFields(files: BuildOutputFile[]): {
	exportsField: ExportsField
	entryPoints: Partial<Record<EntryPoint, string>>
} {
	const exportsField: ExportsField = {}
	const entryPoints: Partial<Record<EntryPoint, string>> = {}

	const filteredFiles = filterFiles(files)

	for (const file of filteredFiles) {
		const exportType = formatToExportField(file.format, file.dts)
		const relativePath = `./${cleanPath(file.relativePathToRootDir)}`

		const exportKey = getExportKey(cleanPath(file.relativePathToOutputDir))

		exportsField[exportKey] = {
			...exportsField[exportKey],
			[exportType]: relativePath,
		}
	}

	for (const field of Object.keys(exportsField['.'] ?? {})) {
		const entryPoint = exportFieldToEntryPoint(field as ExportField)

		entryPoints[entryPoint] = exportsField['.'][field as ExportField]
	}

	return { exportsField, entryPoints }
}

function filterFiles(files: BuildOutputFile[]): BuildOutputFile[] {
	return files.filter(
		(file) => JS_DTS_RE.test(file.fullPath) && file.kind === 'entry-point',
	)
}

function getExportKey(relativePathToOutputDir: string): string {
	const pathSegments = cleanPath(
		removeExtension(relativePathToOutputDir),
	).split('/')

	// index.ts -> .
	// client/index.ts -> ./client
	// utils/index.ts -> ./utils
	// components/ui/button.ts -> ./components/ui/button

	if (pathSegments.length === 1 && pathSegments[0].startsWith('index')) {
		return '.'
	}

	return `./${pathSegments.filter((p) => !p.startsWith('index')).join('/')}`
}

function exportFieldToEntryPoint(exportField: ExportField): EntryPoint {
	return exportField === 'types'
		? 'types'
		: exportField === 'require'
			? 'main'
			: 'module'
}

function formatToExportField(format: Format, dts: boolean): ExportField {
	return dts ? 'types' : format === 'esm' ? 'import' : 'require'
}
