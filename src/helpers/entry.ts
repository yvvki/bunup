import type { BuildOptions, Entry } from '../options'
import type { BunBuildOptions } from '../types'
import { cleanPath, removeExtension } from '../utils'

export type ProcessableEntry = {
    /** The entry same as the entry option in the config */
    entry: string
    /**
     * The base path of the output file relative to the output directory, excluding the extension.
     * Examples:
     * - If the entry is "src/client/index.ts", the outputBasePath will be "client/index"
     * - If the entry is "src/index.ts", the outputBasePath will be "index"
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
                    dts.entry === entry.entry &&
                    dts.outputBasePath === entry.outputBasePath,
            )
            if (matchingDtsEntry) {
                processedPaths.add(`${entry.entry}:${entry.outputBasePath}`)
            }
            return {
                ...entry,
                dts: !!matchingDtsEntry,
            }
        })

        const remainingDtsEntries = dtsEntries.filter(
            (entry) =>
                !processedPaths.has(`${entry.entry}:${entry.outputBasePath}`),
        )

        return [...updatedEntries, ...remainingDtsEntries]
    }

    return entries
}

function normalizeEntries(entry: Entry, isDts: boolean): ProcessableEntry[] {
    if (typeof entry === 'string') {
        return [
            {
                entry,
                outputBasePath: getEntryOutputBasePath(entry),
                dts: isDts,
            },
        ]
    }

    if (typeof entry === 'object' && !Array.isArray(entry)) {
        return Object.entries(entry).map(([name, path]) => ({
            entry: path,
            outputBasePath: name,
            dts: isDts,
        }))
    }

    return entry.map((_entry) => ({
        entry: _entry,
        outputBasePath: getEntryOutputBasePath(_entry),
        dts: isDts,
    }))
}

// utils/index.ts -> index
// src/index.ts -> index
// src/client/index.ts -> client/index
function getEntryOutputBasePath(entry: string): string {
    const pathSegments = cleanPath(removeExtension(entry)).split('/')
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
