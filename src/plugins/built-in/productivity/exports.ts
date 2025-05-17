import { logger } from '../../../logger'
import type { Format } from '../../../options'
import { getJsonSpaceCount, isIndexFile } from '../../../utils'
import type { BuildOutputFile, BunupPlugin } from '../../types'

type ExportsField = Record<string, Record<string, string>>

/**
 * A plugin that generates the exports field in the package.json file automatically.
 */
export function exports(): BunupPlugin {
    return {
        type: 'bunup',
        name: 'exports',
        hooks: {
            onBuildDone: async ({ output, meta }) => {
                if (!meta.packageJson.path || !meta.packageJson.data) {
                    return
                }

                try {
                    const packageJsonContent = await Bun.file(
                        meta.packageJson.path,
                    ).text()

                    const packageJson = JSON.parse(packageJsonContent)

                    const { exportsField, otherExports } =
                        generateExportsFields(output.files)

                    const newPackageJson = {
                        ...packageJson,
                        ...otherExports,
                        exports: exportsField,
                    }

                    await Bun.write(
                        meta.packageJson.path,
                        JSON.stringify(
                            newPackageJson,
                            null,
                            getJsonSpaceCount(packageJsonContent),
                        ),
                    )

                    logger.cli('Added exports field to package.json')
                } catch {
                    logger.error(
                        'Failed to generate exports field in package.json',
                    )
                }
            },
        },
    }
}

function generateExportsFields(files: BuildOutputFile[]): {
    exportsField: ExportsField
    otherExports: Record<string, string>
} {
    const exportsField: ExportsField = { '.': {} }
    const otherExports: Record<string, string> = {}

    const sortedFiles = sortIndexFilesToTop(
        files.filter((file) => file.format !== 'iife'),
    )

    let seenIndexEntry: string | null = null

    for (const file of sortedFiles) {
        const exportType = formatToExportField(file.format, file.dts)
        const relativePath = `./${file.relativePathToRootDir}`

        if (
            isIndexFile(file.fullPath) &&
            (!seenIndexEntry || seenIndexEntry === file.entry)
        ) {
            seenIndexEntry = file.entry

            otherExports[exportType] = relativePath
            exportsField['.'][exportType] = relativePath
        } else {
            const exportKey = `./${getExportKey(file.outputBasePath ?? file.entry)}`

            exportsField[exportKey] = {
                ...exportsField[exportKey],
                [exportType]: relativePath,
            }
        }
    }

    return { exportsField, otherExports }
}

function getExportKey(filePath: string): string {
    return filePath
        .split('/')
        .filter((p) => p !== 'index')
        .join('/')
}

export function formatToExportField(format: Format, dts: boolean): string {
    return dts ? 'types' : format === 'esm' ? 'import' : 'require'
}

function getPathDepth(path: string): number {
    return (path.match(/\//g) || []).length
}

/**
 * Sorts index files to appear first in the array, prioritizing by directory depth
 * (shallower paths like 'src/index.ts' appear before deeper ones like 'src/utils/index.ts')
 */
function sortIndexFilesToTop(files: BuildOutputFile[]): BuildOutputFile[] {
    return [...files].sort((a, b) => {
        const aIsIndex = isIndexFile(a.fullPath)
        const bIsIndex = isIndexFile(b.fullPath)

        if (aIsIndex && bIsIndex) {
            const aDepth = getPathDepth(a.fullPath)
            const bDepth = getPathDepth(b.fullPath)
            return aDepth - bDepth
        }

        if (aIsIndex) return -1
        if (bIsIndex) return 1

        return 0
    })
}
