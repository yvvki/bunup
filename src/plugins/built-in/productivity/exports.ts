import { JS_DTS_RE } from '../../../constants/re'
import { logger } from '../../../logger'
import type { Format } from '../../../options'
import { makePortablePath } from '../../../utils'
import type { BuildOutputFile, BunupPlugin } from '../../types'

type ExportField = 'require' | 'import' | 'types'
type EntryPoint = 'main' | 'module' | 'types'
type ExportsField = Record<string, Record<ExportField, string>>

/**
 * A plugin that generates the exports field in the package.json file automatically.
 */
export function exports(): BunupPlugin {
	return {
		type: 'bunup',
		name: 'exports',
		hooks: {
			onBuildDone: async ({ output, options, meta }) => {
				if (!meta.packageJson.path || !meta.packageJson.data) {
					return
				}

				try {
					const { exportsField, entryPoints } = generateExportsFields(
						output.files,
					)

					const files = Array.isArray(meta.packageJson.data.files)
						? [...new Set([...meta.packageJson.data.files, options.outDir])]
						: [options.outDir]

					const existingExports = meta.packageJson.data.exports || {}
					const mergedExports: ExportsField = { ...existingExports }

					for (const [key, value] of Object.entries(exportsField)) {
						mergedExports[key] = value
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
				} catch (error) {
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

	for (const file of filterJsDtsFiles(files)) {
		const exportType = formatToExportField(file.format, file.dts)
		const relativePath = `./${makePortablePath(file.relativePathToRootDir)}`

		const exportKey = getExportKey(file.outputBasePath)

		exportsField[exportKey] = {
			...exportsField[exportKey],
			[exportType]: relativePath,
		}

		for (const field of Object.keys(exportsField['.'] ?? {})) {
			entryPoints[exportFieldToEntryPoint(field as ExportField, file.dts)] =
				exportsField['.'][field as ExportField]
		}
	}

	return { exportsField, entryPoints }
}

export function filterJsDtsFiles(files: BuildOutputFile[]): BuildOutputFile[] {
	return files.filter((file) => JS_DTS_RE.test(file.fullPath))
}

function getExportKey(outputBasePath: string): string {
	const pathSegments = outputBasePath.split('/')

	// index -> .
	// client/index -> ./client
	// utils/index -> ./utils
	// components/ui/button -> ./components/ui/button

	if (pathSegments.length === 1 && pathSegments[0] === 'index') {
		return '.'
	}

	return `./${pathSegments.filter((p) => p !== 'index').join('/')}`
}

function exportFieldToEntryPoint(
	exportField: ExportField,
	dts: boolean,
): EntryPoint {
	return dts ? 'types' : exportField === 'require' ? 'main' : 'module'
}

function formatToExportField(format: Format, dts: boolean): ExportField {
	return dts ? 'types' : format === 'esm' ? 'import' : 'require'
}
