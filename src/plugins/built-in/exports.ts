import path from 'node:path'
import { JS_DTS_RE } from '../../constants/re'
import { logger } from '../../logger'
import type { Format } from '../../options'
import { cleanPath } from '../../utils'
import type { BuildContext, BuildOutputFile, BunupPlugin } from '../types'

type ExportField = 'require' | 'import' | 'types'
type EntryPoint = 'main' | 'module' | 'types'
type ExportsField = Record<string, Record<ExportField, string>>

type CustomExports = Record<
	string,
	string | Record<string, string | Record<string, string>>
>

type Exclude = ((ctx: BuildContext) => string[] | undefined) | string[]

interface ExportsPluginOptions {
	/**
	 * Additional export fields to preserve alongside automatically generated exports
	 *
	 * @see https://bunup.dev/docs/plugins/exports#customexports
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
	/**
	 * Entry points to exclude from the exports field
	 *
	 * @see https://bunup.dev/docs/plugins/exports#exclude
	 */
	exclude?: Exclude
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
				await processPackageJsonExports(ctx, options)
			},
		},
	}
}

async function processPackageJsonExports(
	ctx: BuildContext,
	options: ExportsPluginOptions,
): Promise<void> {
	const { output, options: buildOptions, meta } = ctx

	if (!meta.packageJson.path || !meta.packageJson.data) {
		return
	}

	try {
		const { exportsField, entryPoints } = generateExportsFields(
			output.files,
			options.exclude,
			ctx,
		)

		const updatedFiles = createUpdatedFilesArray(
			meta.packageJson.data,
			buildOptions.outDir,
		)

		const mergedExports = mergeCustomExportsWithGenerated(
			exportsField,
			options.customExports,
			ctx,
		)

		const newPackageJson = createUpdatedPackageJson(
			meta.packageJson.data,
			entryPoints,
			mergedExports,
			updatedFiles,
		)

		await Bun.write(
			meta.packageJson.path,
			JSON.stringify(newPackageJson, null, 2),
		)
	} catch {
		logger.error('Failed to update package.json')
	}
}

function generateExportsFields(
	files: BuildOutputFile[],
	exclude: Exclude | undefined,
	ctx: BuildContext,
): {
	exportsField: ExportsField
	entryPoints: Partial<Record<EntryPoint, string>>
} {
	const exportsField: ExportsField = {}
	const entryPoints: Partial<Record<EntryPoint, string>> = {}

	const filteredFiles = filterFiles(files, exclude, ctx)

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

function createUpdatedFilesArray(
	packageJsonData: Record<string, unknown>,
	outDir: string,
): string[] {
	const existingFiles = Array.isArray(packageJsonData.files)
		? packageJsonData.files
		: []

	return [...new Set([...existingFiles, outDir])]
}

function mergeCustomExportsWithGenerated(
	baseExports: ExportsField,
	customExportsProvider: ExportsPluginOptions['customExports'],
	ctx: BuildContext,
): CustomExports {
	const mergedExports: CustomExports = { ...baseExports }

	if (!customExportsProvider) {
		return mergedExports
	}

	const customExports = customExportsProvider(ctx) ?? {}

	for (const [key, value] of Object.entries(customExports)) {
		if (typeof value === 'string') {
			mergedExports[key] = value
		} else {
			const existingExport = mergedExports[key]
			if (typeof existingExport === 'object' && existingExport !== null) {
				mergedExports[key] = {
					...existingExport,
					...value,
				}
			} else {
				mergedExports[key] = value
			}
		}
	}

	return mergedExports
}

function createUpdatedPackageJson(
	originalData: Record<string, unknown>,
	entryPoints: Partial<Record<EntryPoint, string>>,
	exports: CustomExports,
	files: string[],
): Record<string, unknown> {
	const { main, module, types, ...restPackageJson } = originalData

	const newPackageJson: Record<string, unknown> = {
		name: originalData.name,
		description: originalData.description,
		version: originalData.version,
		type: originalData.type,
		private: originalData.private,
		files,
		...entryPoints,
		exports,
	}

	for (const key in restPackageJson) {
		if (
			Object.hasOwn(restPackageJson, key) &&
			!Object.hasOwn(newPackageJson, key)
		) {
			newPackageJson[key] = restPackageJson[key as keyof typeof restPackageJson]
		}
	}

	return newPackageJson
}

function filterFiles(
	files: BuildOutputFile[],
	exclude: Exclude | undefined,
	ctx: BuildContext,
): BuildOutputFile[] {
	return files.filter(
		(file) =>
			JS_DTS_RE.test(file.fullPath) &&
			file.kind === 'entry-point' &&
			file.entrypoint &&
			!isExcluded(file.entrypoint, exclude, ctx),
	)
}

function isExcluded(
	entrypoint: string,
	exclude: Exclude | undefined,
	ctx: BuildContext,
): boolean {
	if (!exclude) {
		return false
	}

	if (typeof exclude === 'function') {
		const excluded = exclude(ctx)
		if (excluded) {
			return excluded.some((pattern) => new Bun.Glob(pattern).match(entrypoint))
		}
	}

	if (Array.isArray(exclude)) {
		return exclude.some((pattern) => new Bun.Glob(pattern).match(entrypoint))
	}

	return false
}

function getExportKey(relativePathToOutputDir: string): string {
	const pathSegments = cleanPath(
		removeExtension(relativePathToOutputDir),
	).split('/')

	if (pathSegments.length === 1 && pathSegments[0].startsWith('index')) {
		return '.'
	}

	return `./${pathSegments.filter((segment) => !segment.startsWith('index')).join('/')}`
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
