import path from 'node:path'
import { JS_DTS_RE } from '../constants/re'
import { logger } from '../logger'
import type { Format } from '../options'
import { cleanPath } from '../utils'
import type { BuildContext, BuildOutputFile, BunupPlugin } from './types'

type ExportField = 'require' | 'import' | 'types'
type EntryPoint = 'main' | 'module' | 'types'
type ExportsField = Record<string, Record<ExportField, string>>

type CustomExports = Record<
	string,
	string | Record<string, string | Record<string, string>>
>

interface ExportsPluginOptions {
	/**
	 * Additional export fields to preserve alongside automatically generated exports
	 *
	 * @example
	 * ```ts
	 * {
	 * 	customExports: (ctx) => {
	 * 		const { output, options, meta } = ctx
	 * 		return {
	 * 			'./package.json': "package.json",
	 * 		}
	 * 	},
	 * }
	 * ```
	 */
	customExports?: (ctx: BuildContext) => CustomExports | undefined
}

/**
 * A plugin that generates the exports field in the package.json file automatically.
 *
 * @see https://bunup.dev/docs/plugins/exports
 */
export function exports(options: ExportsPluginOptions = {}): BunupPlugin {
	return {
		type: 'bunup',
		name: 'exports',
		hooks: {
			onBuildDone: async (ctx) => {
				const { output, options: buildOptions, meta } = ctx

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

					const mergedExports: CustomExports = { ...exportsField }

					if (options.customExports) {
						for (const [key, value] of Object.entries(
							options.customExports(ctx) ?? {},
						)) {
							if (typeof value === 'string') {
								mergedExports[key] = value
							} else {
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

					const { main, module, types, ...restPackageJson } =
						meta.packageJson.data

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

					for (const key in restPackageJson) {
						if (
							Object.prototype.hasOwnProperty.call(restPackageJson, key) &&
							!Object.prototype.hasOwnProperty.call(newPackageJson, key)
						) {
							newPackageJson[key] =
								restPackageJson[key as keyof typeof restPackageJson]
						}
					}

					await Bun.write(
						meta.packageJson.path,
						JSON.stringify(newPackageJson, null, 2),
					)
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

function removeExtension(filePath: string): string {
	const basename = path.basename(filePath)
	const firstDotIndex = basename.indexOf('.')
	if (firstDotIndex === -1) {
		return filePath
	}

	const nameWithoutExtensions = basename.slice(0, firstDotIndex)
	const directory = path.dirname(filePath)

	return directory === '.'
		? nameWithoutExtensions
		: path.join(directory, nameWithoutExtensions)
}
