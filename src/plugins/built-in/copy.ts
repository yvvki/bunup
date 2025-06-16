import { join } from 'node:path'
import { basename } from 'node:path'
import { isDirectoryPath } from '../../utils'
import type { BunupPlugin } from '../types'

/**
 * A plugin that copies files and directories to the output directory.
 *
 * @param patterns - Array of glob patterns to match files for copying
 * @param outPath - Optional output path. If not provided, uses the build output directory
 * @see https://bunup.dev/docs/plugins/copy
 */
export function copy(patterns: string[], outPath?: string): BunupPlugin {
	return {
		type: 'bunup',
		name: 'copy',
		hooks: {
			onBuildDone: async ({ options, meta }) => {
				const destinationPath = outPath || options.outDir

				for (const pattern of patterns) {
					const glob = new Bun.Glob(pattern)

					for await (const filePath of glob.scan({
						cwd: meta.rootDir,
						dot: true,
					})) {
						const sourceFile = Bun.file(join(meta.rootDir, filePath))

						await Bun.write(
							outPath && isDirectoryPath(outPath)
								? join(destinationPath, basename(filePath))
								: destinationPath,
							sourceFile,
						)
					}
				}
			},
		},
	}
}
