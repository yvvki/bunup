import pc from 'picocolors'

import { formatListWithAnd } from '../../utils'
import type { Plugin } from '../types'

export function unused(): Plugin {
	return {
		type: 'bunup',
		name: 'unused',
		hooks: {
			onBuildDone: async (ctx) => {
				const { options, output, meta } = ctx
				const transpiler = new Bun.Transpiler({
					allowBunRuntime: true,
					target: 'bun',
					loader: 'js',
				})

				const jsFiles = output.files.filter((file) =>
					file.fullPath.includes('.js'),
				)

				const dependenciesMap =
					typeof meta.packageJson.data?.dependencies === 'object'
						? meta.packageJson.data.dependencies
						: {}

				const externals = [
					...(options.external ?? []),
					...(options.noExternal ?? []),
				]

				const allImportPaths = new Set<string>()

				for (const file of jsFiles) {
					const code = await Bun.file(file.fullPath).text()
					const importPaths = transpiler
						.scanImports(code)
						.map((importItem) => importItem.path)

					for (const importPath of importPaths) {
						if (
							externals.some((external) =>
								typeof external === 'string'
									? importPath.startsWith(external)
									: external.test(importPath),
							)
						) {
							continue
						}

						if (
							importPath.startsWith('node:') ||
							importPath.startsWith('bun:')
						) {
							continue
						}

						allImportPaths.add(importPath)
					}
				}

				const allDependencies = new Set<string>()

				for (const dependency of Object.keys(dependenciesMap)) {
					allDependencies.add(dependency)
				}

				const unusedDependencies = Object.keys(dependenciesMap).filter(
					(dependency) => {
						return ![...allImportPaths].some(
							(importPath) =>
								importPath === dependency ||
								importPath.startsWith(`${dependency}/`),
						)
					},
				)

				if (unusedDependencies.length > 0) {
					const count = unusedDependencies.length
					const depText = count === 1 ? 'dependency' : 'dependencies'
					const coloredDeps = formatListWithAnd(
						unusedDependencies.map((dep) => pc.yellow(dep)),
					)
					const removeCommand = pc.cyan(
						`bun remove ${unusedDependencies.join(' ')}`,
					)

					console.log(
						`\nYour project has ${count} unused ${depText}: ${coloredDeps}. ` +
							`You can remove ${count === 1 ? 'it' : 'them'} with ${removeCommand}\n`,
					)
				}
			},
		},
	}
}
