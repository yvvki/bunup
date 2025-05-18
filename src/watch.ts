import path from 'node:path'

import pc from 'picocolors'
import { build } from './build'
import { BunupWatchError, handleError, parseErrorMessage } from './errors'
import { getProcessableEntries } from './helpers/entry'
import { logger } from './logger'
import { type BuildOptions, createBuildOptions } from './options'
import { formatTime } from './utils'

export async function watch(
    partialOptions: Partial<BuildOptions>,
    rootDir: string,
): Promise<void> {
    const watchPaths = new Set<string>()

    const options = createBuildOptions(partialOptions)

    const dtsEntry =
        typeof options.dts === 'object' && 'entry' in options.dts
            ? options.dts.entry
            : undefined

    const processableDtsEntries = dtsEntry
        ? getProcessableEntries(dtsEntry)
        : []

    const processableEntries = getProcessableEntries(options.entry)

    const uniqueEntries = new Set([
        ...processableDtsEntries.map(({ entry }) => entry),
        ...processableEntries.map(({ entry }) => entry),
    ])

    for (const entry of uniqueEntries) {
        const entryPath = path.resolve(rootDir, entry)
        const parentDir = path.dirname(entryPath)
        watchPaths.add(parentDir)
    }

    const chokidar = await import('chokidar')

    const watcher = chokidar.watch(Array.from(watchPaths), {
        persistent: true,
        ignoreInitial: true,
        atomic: true,
        ignorePermissionErrors: true,
        ignored: [
            /[\\/]\.git[\\/]/,
            /[\\/]node_modules[\\/]/,
            path.join(rootDir, options.outDir),
        ],
    })

    let isRebuilding = false

    const triggerRebuild = async (initial = false) => {
        if (isRebuilding) return
        isRebuilding = true
        try {
            const start = performance.now()
            await build(options, rootDir)
            if (!initial) {
                logger.cli(
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
        logger.cli(`File changed: ${changedFile}`, {
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
