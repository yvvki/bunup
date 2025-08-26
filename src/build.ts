import path from 'node:path'
import type { BunPlugin } from 'bun'
import pc from 'picocolors'
import { generateDts, logIsolatedDeclarationErrors } from 'typeroll'
import {
	BunupBuildError,
	BunupDTSBuildError,
	parseErrorMessage,
} from './errors'
import { executeOnSuccess } from './helpers/on-success'
import { loadPackageJson } from './loaders'
import { logger, setSilent, silent } from './logger'
import {
	type BuildOptions,
	createBuildOptions,
	getDefaultChunkNaming,
	getResolvedDefine,
	getResolvedDtsSplitting,
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
import {
	cleanOutDir,
	cleanPath,
	ensureArray,
	getDefaultDtsOutputExtention,
	getDefaultJsOutputExtension,
	getFilesFromGlobs,
	getShortFilePath,
	isJavascriptFile,
	isTypeScriptFile,
	replaceExtension,
} from './utils'

let ac: AbortController | null = null

export async function build(
	partialOptions: Partial<BuildOptions>,
	rootDir: string = process.cwd(),
): Promise<void> {
	if (ac) {
		ac.abort()
	}

	ac = new AbortController()

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
		logger.info(`Using ${getShortFilePath(packageJson.path, 2)}`, {
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

	const entrypoints = await getFilesFromGlobs(
		ensureArray(options.entry),
		rootDir,
	)

	if (!entrypoints.length) {
		throw new BunupBuildError(
			`One or more of the entrypoints you provided do not exist. Please check that each entrypoint points to a valid file.`,
		)
	}

	const buildPromises = ensureArray(options.format).flatMap(async (fmt) => {
		const result = await Bun.build({
			entrypoints: entrypoints.map((file) => `${rootDir}/${file}`),
			format: fmt,
			splitting: getResolvedSplitting(options.splitting, fmt),
			define: getResolvedDefine(options.define, options.env),
			minify: getResolvedMinify(options),
			target: options.target,
			sourcemap: getResolvedSourcemap(options.sourcemap),
			loader: options.loader,
			drop: options.drop,
			naming: {
				chunk: getDefaultChunkNaming(options.name),
			},
			conditions: options.conditions,
			banner: options.banner,
			footer: options.footer,
			publicPath: options.publicPath,
			env: getResolvedEnv(options.env),
			ignoreDCEAnnotations: options.ignoreDCEAnnotations,
			emitDCEAnnotations: options.emitDCEAnnotations,
			throw: false,
			plugins,
		})

		for (const log of result.logs) {
			if (log.level === 'error') {
				throw new BunupBuildError(log.message)
			}
			if (log.level === 'warning') logger.warn(log.message)
			else if (log.level === 'info') logger.info(log.message)
		}

		let entrypointIndex = 0

		for (const file of result.outputs) {
			const content = await file.text()

			const pathRelativeToOutdir = cleanPath(
				isJavascriptFile(file.path) && file.kind === 'entry-point'
					? replaceExtension(
							file.path,
							getDefaultJsOutputExtension(fmt, packageType),
						)
					: file.path,
			)

			const pathRelativeToRootDir = path.join(
				options.outDir,
				pathRelativeToOutdir,
			)

			const fullPath = path.resolve(rootDir, pathRelativeToRootDir)

			await Bun.write(fullPath, content)

			logger.success(`${pc.dim(`${options.outDir}/`)}${pathRelativeToOutdir}`, {
				identifier: options.name,
			})

			if (!buildOutput.files.some((f) => f.fullPath === fullPath)) {
				buildOutput.files.push({
					fullPath,
					pathRelativeToRootDir,
					pathRelativeToOutdir,
					dts: false,
					format: fmt,
					kind: file.kind,
					entrypoint:
						file.kind === 'entry-point'
							? cleanPath(entrypoints[entrypointIndex])
							: undefined,
				})

				if (file.kind === 'entry-point') {
					entrypointIndex++
				}
			}
		}
	})

	await Promise.all(buildPromises)

	if (options.dts ?? entrypoints.some(isTypeScriptFile)) {
		try {
			const { entry, splitting, ...dtsOptions } =
				typeof options.dts === 'object' ? options.dts : {}

			const dtsResult = await generateDts(ensureArray(entry ?? entrypoints), {
				cwd: rootDir,
				preferredTsConfigPath: options.preferredTsconfigPath,
				splitting: getResolvedDtsSplitting(options.splitting, splitting),
				naming: {
					chunk: getDefaultChunkNaming(options.name),
				},
				...dtsOptions,
			})

			if (dtsResult.errors.length && !silent) {
				logIsolatedDeclarationErrors(dtsResult.errors)
			}

			for (const fmt of ensureArray(options.format)) {
				for (const file of dtsResult.files) {
					const dtsExtension = getDefaultDtsOutputExtention(
						fmt,
						packageType,
						file.kind,
					)
					const pathRelativeToOutdir = cleanPath(
						`${file.pathInfo.outputPathWithoutExtension}${dtsExtension}`,
					)
					const pathRelativeToRootDir = cleanPath(
						`${options.outDir}/${pathRelativeToOutdir}`,
					)

					if (file.kind === 'entry-point') {
						logger.success(
							`${pc.dim(`${options.outDir}/`)}${pathRelativeToOutdir}`,
							{
								identifier: options.name,
							},
						)
					}

					const fullPath = path.join(rootDir, pathRelativeToRootDir)

					await Bun.write(fullPath, file.dts)

					buildOutput.files.push({
						fullPath,
						pathRelativeToRootDir,
						pathRelativeToOutdir,
						dts: true,
						format: fmt,
						kind: file.kind,
						entrypoint: file.entrypoint
							? cleanPath(file.entrypoint)
							: undefined,
					})
				}
			}
		} catch (error) {
			throw new BunupDTSBuildError(parseErrorMessage(error))
		}
	}

	await runPluginBuildDoneHooks(bunupPlugins, options, buildOutput, {
		packageJson,
		rootDir,
	})

	if (options.onSuccess) {
		await executeOnSuccess(options.onSuccess, options, ac.signal)
	}
}
