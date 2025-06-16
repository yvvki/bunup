import { logger } from '../../logger'
import type { BunupPlugin } from '../types'

export function linter(): BunupPlugin {
	return {
		type: 'bunup',
		name: 'linter',
		hooks: {
			onBuildDone: (ctx) => {
				logger.space()
				if (
					ctx.meta.packageJson.data?.type !== 'module' &&
					ctx.options.format.length === 1 &&
					ctx.options.format[0] === 'esm'
				) {
					logger.warn(
						'You are using ESM format but your package.json does not have "type": "module". This may cause issues with module resolution.',
					)
				}
			},
		},
	}
}
