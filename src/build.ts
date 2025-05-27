import path from 'node:path'
import { generateDts, logIsolatedDeclarationErrors } from 'bun-dts'
import { BunupBuildError } from './errors'
import { getProcessableEntries, getResolvedNaming } from './helpers/entry'
import { loadPackageJson } from './loaders'
import { logger, setSilent } from './logger'
import {
	type BuildOptions,
	createBuildOptions,
	getResolvedBytecode,
	getResolvedDefine,
	getResolvedEnv,
	getResolvedMinify,
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
	getDefaultDtsOutputExtension,
	getDefaultJsOutputExtension,
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

	const processableEntries = getProcessableEntries(options.entry)

	const packageType = packageJson.data?.type as string | undefined

	const plugins: BunPlugin[] = [
		externalOptionPlugin(options, packageJson.data),
		...filterBunupBunPlugins(options.plugins).map((p) => p.plugin),
	]

	if (!options.dtsOnly) {
		const buildPromises = options.format.flatMap((fmt) =>
			processableEntries.map(async ({ entry, outputBasePath }) => {
				const extension =
					options.outputExtension?.({
						format: fmt,
						packageType,
						options,
						entry,
					}).js ?? getDefaultJsOutputExtension(fmt, packageType)

				const result = await Bun.build({
					entrypoints: [`${rootDir}/${entry}`],
					format: fmt,
					naming: getResolvedNaming(outputBasePath, extension),
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
					plugins: plugins,
					throw: false,
				})

				for (const log of result.logs) {
					if (log.level === 'error') {
						throw new BunupBuildError(log.message)
					}
					if (log.level === 'warning') logger.warn(log.message)
					else if (log.level === 'info') logger.info(log.message)
				}

				for (const file of result.outputs) {
					const relativePathToRootDir = getRelativePathToRootDir(
						file.path,
						rootDir,
					)
					if (file.kind === 'entry-point') {
						logger.progress(fmt.toUpperCase(), relativePathToRootDir, {
							identifier: options.name,
						})
					}
					buildOutput.files.push({
						fullPath: file.path,
						relativePathToRootDir,
						dts: false,
						entry,
						outputBasePath,
						format: fmt,
					})
				}
			}),
		)

		await Promise.all(buildPromises)
	}

	if (
		options.dts === true ||
		typeof options.dts === 'object' ||
		options.dtsOnly
	) {
		const dtsResolve =
			typeof options.dts === 'object' && 'resolve' in options.dts
				? options.dts.resolve
				: undefined

		const dtsEntry =
			typeof options.dts === 'object' && 'entry' in options.dts
				? options.dts.entry
				: undefined

		const processableDtsEntries = dtsEntry
			? getProcessableEntries(dtsEntry)
			: processableEntries

		const dtsPromises = processableDtsEntries.map(
			async ({ entry, outputBasePath }) => {
				const result = await generateDts(entry, {
					cwd: rootDir,
					preferredTsConfigPath: options.preferredTsconfigPath,
					resolve: dtsResolve,
				})

				for (const fmt of options.format) {
					const extension =
						options.outputExtension?.({
							format: fmt,
							packageType,
							options,
							entry,
						}).dts ?? getDefaultDtsOutputExtension(fmt, packageType)

					const filePath = path.join(
						rootDir,
						options.outDir,
						`${outputBasePath}${extension}`,
					)

					const relativePathToRootDir = getRelativePathToRootDir(
						filePath,
						rootDir,
					)

					buildOutput.files.push({
						fullPath: filePath,
						relativePathToRootDir,
						dts: true,
						entry,
						outputBasePath,
						format: fmt,
					})

					if (result.errors.length > 0) {
						logIsolatedDeclarationErrors(result.errors, {
							warnInsteadOfError: options.watch,
							shouldExit: true,
						})
					}

					await Bun.write(filePath, result.dts)

					logger.progress('DTS', relativePathToRootDir, {
						identifier: options.name,
					})
				}
			},
		)

		await Promise.all(dtsPromises)
	}

	await runPluginBuildDoneHooks(bunupPlugins, options, buildOutput, {
		packageJson,
	})

	if (options.onSuccess) {
		await options.onSuccess(options)
	}
}

function getRelativePathToRootDir(filePath: string, rootDir: string) {
	return filePath.replace(`${rootDir}/`, '')
}
