import pc from 'picocolors'
import { type TableColumn, logTable } from '../../logger'
import { formatFileSize } from '../../utils'
import type { BunupPlugin } from '../types'

/**
 * A plugin that logs a report of the bundle size.
 *
 * @deprecated This plugin is enabled by default. Bundle size reports are automatically logged without needing to use this plugin.
 */
export function report(): BunupPlugin {
	return {
		type: 'bunup',
		name: 'report',
		hooks: {
			onBuildDone: async ({ options, output }) => {
				if (options.watch) return

				const files = await Promise.all(
					output.files.map(async (file) => {
						const name = file.relativePathToRootDir
						const size = Bun.file(file.fullPath).size
						const gzipSize = Bun.gzipSync(
							new Uint8Array(await Bun.file(file.fullPath).arrayBuffer()),
						).length
						const formattedGzipSize = formatFileSize(gzipSize)

						return {
							name,
							size,
							formattedSize: formatFileSize(size),
							gzipSize,
							formattedGzipSize,
						}
					}),
				)

				const totalSize = files.reduce((sum, file) => sum + file.size, 0)
				const formattedTotalSize = formatFileSize(totalSize)

				const totalGzipSize = files.reduce(
					(sum, file) => sum + (file.gzipSize || 0),
					0,
				)
				const formattedTotalGzipSize = formatFileSize(totalGzipSize)

				const columns: TableColumn[] = [
					{ header: 'File', align: 'left', color: pc.blue },
					{ header: 'Size', align: 'right', color: pc.green },
					{
						header: 'Gzip',
						align: 'right',
						color: pc.magenta,
					},
				]

				const data = files.map((file) => {
					return {
						File: file.name,
						Size: file.formattedSize,
						Gzip: file.formattedGzipSize,
					}
				})

				const footer = {
					File: 'Total',
					Size: formattedTotalSize,
					Gzip: formattedTotalGzipSize,
				}

				console.log('')
				logTable(columns, data, footer)
				console.log('')
			},
		},
	}
}
