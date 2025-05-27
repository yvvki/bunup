import { mkdir, stat } from 'node:fs/promises'
import { dirname } from 'node:path'
import { Glob } from 'bun'
import type { BunupPlugin } from '../../types'

/**
 * A plugin that copies files and directories to the output directory.
 *
 * @see https://bunup.dev/docs/plugins/productivity#copy
 */
export function copy(patterns: string[], outDir?: string): BunupPlugin {
	return {
		type: 'bunup',
		name: 'copy',
		hooks: {
			onBuildDone: async ({ options }) => {
				const targetDir = outDir || options.outDir

				for (const pattern of patterns) {
					let globPattern = pattern

					if (!pattern.includes('*') && !pattern.includes('?')) {
						try {
							const stats = await stat(pattern)
							if (stats.isDirectory()) {
								globPattern = `${pattern}/**/*`
							}
						} catch {}
					}

					const glob = new Glob(globPattern)

					for await (const file of glob.scan('.')) {
						const targetPath = `${targetDir}/${file}`
						await mkdir(dirname(targetPath), { recursive: true })
						await Bun.write(targetPath, Bun.file(file))
					}
				}
			},
		},
	}
}
