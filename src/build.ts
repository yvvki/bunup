import path from 'node:path'
import { dts } from 'bun-dts'
import { BunupBuildError, BunupDTSBuildError } from './errors'
import { loadPackageJson } from './loaders'
import { logger, setSilent } from './logger'
import {
	type BuildOptions,
	createBuildOptions,
	getResolvedBytecode,
	getResolvedDefine,
	getResolvedEnv,
	getResolvedMinify,
	getResolvedNaming,
	getResolvedSourcemap,
	getResolvedSplitting,
} from './options'
import { externalOptionPlugin } from './plugins/internal/external-option'
import type { BuildOutput } from './plugins/types'
import {
	filterBunupBunPlugins,
	filterBunupPlugins,
	runPluginBuildDoneHooks,
	runPluginBuildStartHooks,
} from './plugins/utils'
import type { BunPlugin } from './types'
import {
	cleanOutDir,
	cleanPath,
	ensureArray,
	getFilesFromGlobs,
	getShortFilePath,
} from './utils'

export async function build(
	partialOptions: Partial<BuildOptions>,
	rootDir: string = process.cwd(),
): Promise<void> {
	const buildOutput: BuildOutput = {
		files: [],
	}

	const options = createBuildOptions(partialOptions)

	if (!options.entry || options.entry.length === 0 || !options.outDir) {
		throw new BunupBuildError(
			'Nothing to build. Please make sure you have provided a proper bunup configuration or cli arguments.',
		)
	}

	if (options.clean) {
		cleanOutDir(rootDir, options.outDir)
	}

	setSilent(options.silent)

	const packageJson = await loadPackageJson(rootDir)

	if (packageJson.data && packageJson.path) {
		logger.cli(`Using ${getShortFilePath(packageJson.path, 2)}`, {
			muted: true,
			identifier: options.name,
			once: `${packageJson.path}:${options.name}`,
		})
	}

	const bunupPlugins = filterBunupPlugins(options.plugins)

	await runPluginBuildStartHooks(bunupPlugins, options)

	const packageType = packageJson.data?.type as string | undefined

	const plugins: BunPlugin[] = [
		externalOptionPlugin(options, packageJson.data),
		...filterBunupBunPlugins(options.plugins).map((p) => p.plugin),
	]

	let hasBuiltAnyFormat = false

	if (options.dts) {
		const { resolve, entry, splitting } =
			typeof options.dts === 'object' ? options.dts : {}

		let entrypoints: string[] | undefined
		if (entry) {
			entrypoints = await getFilesFromGlobs(ensureArray(entry), rootDir)
		}

		if (Array.isArray(entrypoints) && !entrypoints.length) {
			throw new BunupDTSBuildError(
				'The dts entrypoints you provided do not exist. Please make sure the entrypoints point to valid files.',
			)
		}

		plugins.push(
			dts({
				resolve,
				preferredTsConfigPath: options.preferredTsconfigPath,
				entry: entrypoints,
				cwd: rootDir,
				splitting,
				silent: () => !hasBuiltAnyFormat,
				onDeclarationsGenerated({ result, buildConfig }) {
					for (const file of result.files) {
						logger.progress('DTS', `${options.outDir}/${file.outputPath}`, {
							identifier: options.name,
						})

						const fullPath = path.join(rootDir, options.outDir, file.outputPath)

						if (buildConfig.format) {
							buildOutput.files.push({
								fullPath,
								relativePathToRootDir: getRelativePathToRootDir(
									fullPath,
									rootDir,
								),
								relativePathToOutputDir: file.outputPath,
								dts: true,
								format: buildConfig.format,
								kind: file.kind,
							})
						}
					}
				},
			}),
		)
	}

	const entrypoints = await getFilesFromGlobs(
		ensureArray(options.entry),
		rootDir,
	)

	if (!entrypoints.length) {
		throw new BunupBuildError(
			'The entrypoints you provided do not exist. Please make sure the entrypoints point to valid files.',
		)
	}

	const buildPromises = options.format.flatMap(async (fmt) => {
		const result = await Bun.build({
			entrypoints: entrypoints.map((file) => `${rootDir}/${file}`),
			format: fmt,
			naming: getResolvedNaming(options.naming, fmt, packageType),
			splitting: getResolvedSplitting(options.splitting, fmt),
			bytecode: getResolvedBytecode(options.bytecode, fmt),
			define: getResolvedDefine(options.define, options.env),
			minify: getResolvedMinify(options),
			outdir: `${rootDir}/${options.outDir}`,
			target: options.target,
			sourcemap: getResolvedSourcemap(options.sourcemap),
			loader: options.loader,
			drop: options.drop,
			banner: options.banner,
			footer: options.footer,
			publicPath: options.publicPath,
			env: getResolvedEnv(options.env),
			plugins,
			throw: false,
		})

		hasBuiltAnyFormat = true

		for (const log of result.logs) {
			if (log.level === 'error') {
				throw new BunupBuildError(log.message)
			}
			if (log.level === 'warning') logger.warn(log.message)
			else if (log.level === 'info') logger.info(log.message)
		}

		for (const file of result.outputs) {
			const relativePathToRootDir = getRelativePathToRootDir(file.path, rootDir)
			if (file.kind === 'entry-point') {
				logger.progress(fmt.toUpperCase(), relativePathToRootDir, {
					identifier: options.name,
				})
			}
			buildOutput.files.push({
				fullPath: file.path,
				relativePathToRootDir,
				relativePathToOutputDir: getRelativePathToOutputDir(
					relativePathToRootDir,
					options.outDir,
				),
				dts: false,
				format: fmt,
				kind: file.kind,
			})
		}
	})

	await Promise.all(buildPromises)

	await runPluginBuildDoneHooks(bunupPlugins, options, buildOutput, {
		packageJson,
		rootDir,
	})

	if (options.onSuccess) {
		await options.onSuccess(options)
	}
}

function getRelativePathToRootDir(filePath: string, rootDir: string) {
	return cleanPath(filePath).replace(`${cleanPath(rootDir)}/`, '')
}

function getRelativePathToOutputDir(
	relativePathToRootDir: string,
	outDir: string,
) {
	return cleanPath(relativePathToRootDir).replace(`${cleanPath(outDir)}/`, '')
}
