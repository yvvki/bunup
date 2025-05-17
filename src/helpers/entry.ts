import type { BuildOptions, Entry } from '../options'
import type { BunBuildOptions } from '../types'
import { removeExtension } from '../utils'

export type ProcessableEntry = {
    /** The entry same as the entry option in the config */
    path: string
    /**
     * The base path of the output file relative to the output directory, excluding the file name
     * Example: If the full output path is "path/to/dist/src/components/Button.js",
     * the outputBasePath would be "src/components"
     */
    outputBasePath: string
    /** Whether to generate a dts file for this entry */
    dts: boolean
}

export function getProcessableEntries(
    options: BuildOptions,
): ProcessableEntry[] {
    const dtsEntry =
        typeof options.dts === 'object' && 'entry' in options.dts
            ? options.dts.entry
            : undefined

    const entries = normalizeEntries(options.entry, false)

    if (typeof options.dts !== 'undefined') {
        if (!dtsEntry) {
            return entries.map((entry) => ({ ...entry, dts: true }))
        }

        const dtsEntries = normalizeEntries(dtsEntry, true)
        const processedPaths = new Set<string>()

        const updatedEntries = entries.map((entry) => {
            const matchingDtsEntry = dtsEntries.find(
                (dts) =>
                    dts.path === entry.path &&
                    dts.outputBasePath === entry.outputBasePath,
            )
            if (matchingDtsEntry) {
                processedPaths.add(`${entry.path}:${entry.outputBasePath}`)
            }
            return {
                ...entry,
                dts: !!matchingDtsEntry,
            }
        })

        const remainingDtsEntries = dtsEntries.filter(
            (entry) =>
                !processedPaths.has(`${entry.path}:${entry.outputBasePath}`),
        )

        return [...updatedEntries, ...remainingDtsEntries]
    }

    return entries
}

function normalizeEntries(entry: Entry, isDts: boolean): ProcessableEntry[] {
    if (typeof entry === 'string') {
        return [
            {
                path: entry,
                outputBasePath: getEntryOutputBasePath(entry),
                dts: isDts,
            },
        ]
    }

    if (typeof entry === 'object' && !Array.isArray(entry)) {
        return Object.entries(entry).map(([name, path]) => ({
            path,
            outputBasePath: name,
            dts: isDts,
        }))
    }

    return entry.map((entryPath) => ({
        path: entryPath,
        outputBasePath: getEntryOutputBasePath(entryPath),
        dts: isDts,
    }))
}

// utils/index.ts -> index
// src/index.ts -> index
// src/client/index.ts -> client/index
function getEntryOutputBasePath(path: string): string {
    const pathSegments = removeExtension(path).split('/')
    return pathSegments.length > 1
        ? pathSegments.slice(1).join('/')
        : pathSegments.join('/')
}

export function getResolvedNaming(
    outputBasePath: string,
    extension: string,
): BunBuildOptions['naming'] {
    return {
        entry: `[dir]/${outputBasePath}${extension}`,
        chunk: `${outputBasePath}-[hash].[ext]`,
        asset: `${outputBasePath}-[name]-[hash].[ext]`,
    }
}
