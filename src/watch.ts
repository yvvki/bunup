import path from 'node:path'

import pc from 'picocolors'
import { build } from './build'
import { BunupWatchError, handleError, parseErrorMessage } from './errors'
import { logger } from './logger'
import { type BuildOptions, createBuildOptions } from './options'
import { formatTime } from './utils'

export async function watch(
	partialOptions: Partial<BuildOptions>,
	rootDir: string,
): Promise<void> {
	const watchPaths = new Set<string>()

	const options = createBuildOptions(partialOptions)

	const uniqueEntries = new Set(options.entry)

	for (const entry of uniqueEntries) {
		const entryPath = path.resolve(rootDir, entry)
		const parentDir = path.dirname(entryPath)
		watchPaths.add(parentDir)
	}

	const chokidar = await import('chokidar')

	const watcher = chokidar.watch(Array.from(watchPaths), {
		ignoreInitial: true,
		ignorePermissionErrors: true,
		ignored: [
			/[\\/]\.git[\\/]/,
			/[\\/]node_modules[\\/]/,
			path.join(rootDir, options.outDir),
		],
	})

	let isRebuilding = false

	const triggerRebuild = async (initial = false) => {
		if (isRebuilding) {
			return
		}
		isRebuilding = true
		try {
			await new Promise((resolve) => setTimeout(resolve, 20))
			const start = performance.now()
			await build(options, rootDir)
			if (!initial) {
				logger.success(
					`📦 Rebuild finished in ${pc.green(formatTime(performance.now() - start))}`,
				)
			}
		} catch (error) {
			handleError(error)
		} finally {
			isRebuilding = false
		}
	}

	watcher.on('change', (filePath) => {
		const changedFile = path.relative(rootDir, filePath)
		logger.info(`File changed: ${changedFile}`, {
			muted: true,
			once: changedFile,
		})
		triggerRebuild()
	})

	watcher.on('error', (error) => {
		throw new BunupWatchError(`Watcher error: ${parseErrorMessage(error)}`)
	})

	await triggerRebuild(true)
}
