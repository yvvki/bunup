import { mkdir, stat } from 'node:fs/promises'
import { dirname } from 'node:path'
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
			onBuildDone: async ({ options, meta }) => {
				const targetDir = outDir || options.outDir
				const baseDir = meta.rootDir

				for (const pattern of patterns) {
					let globPattern = pattern

					if (!pattern.includes('*') && !pattern.includes('?')) {
						try {
							const stats = await stat(`${baseDir}/${pattern}`)
							if (stats.isDirectory()) {
								globPattern = `${pattern}/**/*`
							}
						} catch {}
					}

					const glob = new Bun.Glob(globPattern)

					for await (const file of glob.scan(baseDir)) {
						const targetPath = `${targetDir}/${file}`
						await mkdir(dirname(targetPath), { recursive: true })
						await Bun.write(targetPath, Bun.file(`${baseDir}/${file}`))
					}
				}
			},
		},
	}
}
