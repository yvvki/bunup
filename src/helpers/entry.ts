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
    outputBasePath: string | null
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
                outputBasePath: null,
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

    return entry.map((entryPath) => processEntryPath(entryPath, isDts))
}

function processEntryPath(entryPath: string, isDts: boolean): ProcessableEntry {
    const pathSegments = removeExtension(entryPath).split('/')

    return {
        path: entryPath,
        outputBasePath:
            pathSegments.length > 1
                ? pathSegments.slice(1).join('/')
                : pathSegments.join('/'),
        dts: isDts,
    }
}

export function getResolvedNaming(
    outputBasePath: string | null,
    extension: string,
): BunBuildOptions['naming'] {
    return {
        entry: `[dir]/${outputBasePath || '[name]'}${extension}`,
        chunk: `${outputBasePath || '[name]'}-[hash].[ext]`,
        asset: `${outputBasePath ? `${outputBasePath}-` : ''}[name]-[hash].[ext]`,
    }
}
