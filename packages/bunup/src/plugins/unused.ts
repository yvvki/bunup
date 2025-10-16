import pc from 'picocolors'
import { logger } from '../printer/logger'
import { isJavascriptFile } from '../utils/file'
import { formatListWithAnd } from '../utils/format'
import type { BunupPlugin } from './types'

export interface UnusedOptions {
	/**
	 * The level of reporting for unused dependencies
	 * @default 'warn'
	 */
	level?: 'warn' | 'error'
	/**
	 * Dependencies to ignore when checking for unused dependencies
	 * @default []
	 */
	ignore?: string[]
}

/**
 * A plugin that detects and reports unused dependencies.
 *
 * @see https://bunup.dev/docs/extra-options/unused
 */
export function unused(options: UnusedOptions = {}): BunupPlugin {
	const { level = 'warn', ignore = [] } = options

	return {
		name: 'unused',
		hooks: {
			onBuildDone: async (ctx) => {
				const { options: buildOptions, output, meta } = ctx

				if (buildOptions.watch) {
					return
				}

				const transpiler = new Bun.Transpiler({
					loader: 'js',
				})

				const jsFiles = output.files.filter((file) =>
					isJavascriptFile(file.fullPath),
				)

				const packageDependencies =
					typeof meta.packageJson.data?.dependencies === 'object'
						? meta.packageJson.data.dependencies
						: {}

				const externals = [
					...(buildOptions.external ?? []),
					...(buildOptions.noExternal ?? []),
				]

				const allImportPaths = new Set<string>()
				for (const file of jsFiles) {
					const code = await Bun.file(file.fullPath).text()
					// Remove shebangs to fix transpiler error "UNEXPECTED #!/usr/bin/env bun"
					const codeWithoutShebang = code.replace(/^#!.*$/m, '')
					const importPaths = transpiler
						.scanImports(codeWithoutShebang)
						.map((imp) => imp.path)

					for (const importPath of importPaths) {
						if (
							externals.some((ex) =>
								typeof ex === 'string'
									? importPath.startsWith(ex)
									: ex.test(importPath),
							)
						)
							continue

						if (importPath.startsWith('node:') || importPath.startsWith('bun:'))
							continue

						allImportPaths.add(importPath)
					}
				}

				const allDependencies = Object.keys(packageDependencies)

				const unusedDependencies = allDependencies.filter((dependency) => {
					if (ignore.includes(dependency)) return false
					return !Array.from(allImportPaths).some(
						(importPath) =>
							importPath === dependency ||
							importPath.startsWith(`${dependency}/`),
					)
				})

				if (unusedDependencies.length > 0) {
					const count = unusedDependencies.length
					const depText = count === 1 ? 'dependency' : 'dependencies'
					const coloredDeps = formatListWithAnd(
						unusedDependencies.map((dep) => pc.yellow(dep)),
					)
					const removeCommand = pc.cyan(
						`bun remove ${unusedDependencies.join(' ')}`,
					)

					const message = [
						`\n  Your project${buildOptions.name ? ` ${buildOptions.name}` : ''} has ${count} unused ${depText}: ${coloredDeps}.`,
						`You can remove ${count === 1 ? 'it' : 'them'} with ${removeCommand}`,
						`or move to devDependencies if you are using ${count === 1 ? 'it' : 'them'} only for types.`,
					].join(' ')

					if (level === 'error') {
						logger.log(pc.red(message))
						process.exit(1)
					} else {
						logger.log(message)
					}
				}
			},
		},
	}
}
