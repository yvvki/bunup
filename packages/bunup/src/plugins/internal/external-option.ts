import { isBuiltin } from 'node:module'
import type { BunPlugin } from 'bun'
import { isExternalFromPackageJson } from '../../helpers/external'
import type { BuildOptions } from '../../options'

export function externalOptionPlugin(
	options: BuildOptions,
	packageJson: Record<string, unknown> | null,
): BunPlugin {
	return {
		name: 'bunup:external-option',
		setup(build) {
			build.onResolve({ filter: /.*/ }, (args) => {
				const importPath = args.path

				if (
					isBuiltin(importPath) ||
					isExternalFromPackageJson(importPath, options, packageJson)
				) {
					return {
						path: importPath,
						external: true,
					}
				}

				return null
			})
		},
	}
}
