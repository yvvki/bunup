#!/usr/bin/env bun

import { loadConfig } from 'coffi'
import pc from 'picocolors'

import { version } from '../../package.json'
import { build } from '../build'
import { handleErrorAndExit } from '../errors'
import { type ProcessableConfig, processLoadedConfigs } from '../loaders'
import { logger, setSilent } from '../logger'
import type { BuildOptions } from '../options'
import type { Arrayable, DefineConfigItem, DefineWorkspaceItem } from '../types'
import { ensureArray, formatTime, getShortFilePath } from '../utils'
import { watch } from '../watch'
import { type CliOptions, parseCliOptions } from './options'

export type LoadedConfig = Arrayable<DefineConfigItem | DefineWorkspaceItem>

async function main(args: string[] = Bun.argv.slice(2)): Promise<void> {
	const cliOptions = parseCliOptions(args)

	setSilent(cliOptions.silent)

	const cwd = process.cwd()

	const { config, filepath } = await loadConfig<LoadedConfig>({
		name: 'bunup.config',
		extensions: ['.ts', '.js', '.mjs', '.cjs'],
		maxDepth: 1,
		preferredPath: cliOptions.config,
		packageJsonProperty: 'bunup',
	})

	const configsToProcess: ProcessableConfig[] = !config
		? [{ rootDir: cwd, options: cliOptions }]
		: await processLoadedConfigs(config, cwd, cliOptions.filter)

	logger.info(`Using bunup v${version} and bun v${Bun.version}`, {
		muted: true,
	})

	if (filepath) {
		logger.info(`Using ${getShortFilePath(filepath, 2)}`, {
			muted: true,
		})
	}

	const startTime = performance.now()

	logger.info('Build started')

	await Promise.all(
		configsToProcess.flatMap(({ options, rootDir }) => {
			const optionsArray = ensureArray(options)
			return optionsArray.map(async (o) => {
				const partialOptions: Partial<BuildOptions> = {
					...o,
					...removeCliOnlyOptions(cliOptions),
				}

				if (partialOptions.watch) {
					await watch(partialOptions, rootDir)
				} else {
					await build(partialOptions, rootDir)
				}
			})
		}),
	)

	const buildTimeMs = performance.now() - startTime
	const timeDisplay = formatTime(buildTimeMs)

	logger.success(`Build completed in ${pc.green(timeDisplay)}`)

	if (cliOptions.watch) {
		logger.info('Watching for file changes...', {
			icon: '👀',
			verticalSpace: true,
		})
	}

	if (!cliOptions.watch) {
		process.exit(process.exitCode ?? 0)
	}
}

function removeCliOnlyOptions(options: Partial<CliOptions>) {
	return {
		...options,
		config: undefined,
		filter: undefined,
	}
}

main().catch((error) => handleErrorAndExit(error))
