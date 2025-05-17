import { logger } from '../../../logger'
import type { Format } from '../../../options'
import { getBaseFileName, getJsonSpaceCount, isIndexFile } from '../../../utils'
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

    for (const file of files) {
        const exportType = formatToExportField(file.format, file.dts)
        const relativePath = `./${file.relativePathToRootDir}`

        if (isIndexFile(file.fullPath)) {
            otherExports[exportType] = relativePath
            exportsField['.'][exportType] = relativePath
        } else {
            const exportKey = `./${file.outputBasePath ?? getBaseFileName(file.entry)}`

            exportsField[exportKey] = {
                ...exportsField[exportKey],
                [exportType]: relativePath,
            }
        }
    }

    return { exportsField, otherExports }
}

export function formatToExportField(format: Format, dts: boolean): string {
    return dts ? 'types' : format === 'esm' ? 'import' : 'require'
}
