import type { Plugin } from '../types'

export function removeNodeProtocol(): Plugin {
	return {
		name: 'remove-node-protocol',
		type: 'bun',
		plugin: {
			name: 'bunup:remove-node-protocol',
			setup(build) {
				build.onLoad(
					{ filter: /\.(js|ts|jsx|tsx|mts|cts)$/ },
					async (args) => {
						try {
							if (args.path.includes('node:')) {
								const contents = await Bun.file(
									args.path,
								).text()

								const modifiedContents = contents
									.replace(
										/from ['"]node:([^'"]+)['"]/g,
										'from "$1"',
									)
									.replace(
										/require\(['"]node:([^'"]+)['"]\)/g,
										'require("$1")',
									)

								return {
									contents: modifiedContents,
								}
							}
						} catch {}
					},
				)
			},
		},
	}
}
