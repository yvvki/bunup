import { build } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

import path from 'node:path'
import type { TsConfigData } from '../loaders'
import { logger } from '../logger'
import type { BuildOptions } from '../options'
import { runPostDtsValidation } from './oxc'
import { getDtsPathFromSourceCodePath } from './utils'
import { virtualDtsPlugin } from './virtual-dts'

export async function generateDtsForEntry(
	relativeEntryFile: string,
	options: BuildOptions,
	tsconfig: TsConfigData,
	rootDir: string,
): Promise<string> {
	const entryFile = path.resolve(rootDir, relativeEntryFile)
	const entryDtsPath = getDtsPathFromSourceCodePath(entryFile)

	const dtsResolve =
		typeof options.dts === 'object' && 'resolve' in options.dts
			? options.dts.resolve
			: undefined

	const { output } = await build({
		input: entryDtsPath,
		write: false,
		...(tsconfig.path && {
			resolve: {
				tsconfigFilename: tsconfig.path,
			},
		}),
		onwarn(warning, handler) {
			if (
				[
					'UNRESOLVED_IMPORT',
					'CIRCULAR_DEPENDENCY',
					'EMPTY_BUNDLE',
				].includes(warning.code ?? '')
			)
				return
			handler(warning)
		},
		plugins: [
			virtualDtsPlugin(entryFile, tsconfig, rootDir),
			dts({
				dtsInput: true,
				emitDtsOnly: true,
				resolve: dtsResolve,
				tsconfig: tsconfig.path ?? false,
			}),
		],
	})

	runPostDtsValidation(!!options.watch)

	const bundledDts = output[0]?.code

	if (!bundledDts) {
		logger.warn(
			`Generated empty declaration file for entry "${entryFile}"`,
			{
				muted: true,
			},
		)

		return ''
	}

	return bundledDts
}
