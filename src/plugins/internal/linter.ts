import { type LogLevel, link, logger } from '../../logger'
import type { BuildContext, BunupPlugin } from '../types'

type LintRule = {
	check: (ctx: BuildContext) => boolean
	message: string
	logLevel?: LogLevel
}

const rules: LintRule[] = [
	{
		check: (ctx) => {
			const hasMinification = !!(
				ctx.options.minify ||
				ctx.options.minifyWhitespace ||
				ctx.options.minifyIdentifiers ||
				ctx.options.minifySyntax
			)
			return hasMinification && !ctx.options.sourcemap
		},
		message: `You are using minification without source maps. Consider enabling source maps to help with debugging minified code. Learn more: ${link('https://bunup.dev/docs/guide/options#source-maps')}`,
		logLevel: 'recommended',
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
						logger[rule.logLevel ?? 'warn'](rule.message)
						hasWarnings = true
					}
				}
			},
		},
	}
}
