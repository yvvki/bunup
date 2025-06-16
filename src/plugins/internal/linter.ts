import { logger } from '../../logger'
import type { BuildContext, BunupPlugin } from '../types'

type LintRule = {
	check: (ctx: BuildContext) => boolean
	message: string
}

const rules: LintRule[] = [
	{
		check: (ctx) =>
			ctx.meta.packageJson.data?.type !== 'module' &&
			ctx.options.format.length === 1 &&
			ctx.options.format[0] === 'esm',
		message:
			'You are using ESM format but your package.json does not have "type": "module". This may cause issues with module resolution.',
	},
]

export function linter(): BunupPlugin {
	return {
		type: 'bunup',
		name: 'linter',
		hooks: {
			onBuildDone: (ctx) => {
				let hasWarnings = false

				for (const rule of rules) {
					if (rule.check(ctx)) {
						if (!hasWarnings) {
							logger.space()
						}
						logger.warn(rule.message)
						hasWarnings = true
					}
				}
			},
		},
	}
}
