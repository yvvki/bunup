import { type LogLevel, link, logger } from '../../logger'
import type { BuildContext, BunupPlugin } from '../types'

type LintRule = {
	check: (ctx: BuildContext) => boolean
	message: string
	logLevel?: LogLevel
}

const rules: LintRule[] = [
	{
		check: (ctx) =>
			ctx.meta.packageJson.data?.type !== 'module' &&
			ctx.options.format.length === 1 &&
			ctx.options.format[0] === 'esm',
		message:
			'You are using only ESM format. It is recommended to add "type": "module" to your package.json to help with module resolution.',
		logLevel: 'recommended',
	},

	{
		check: (ctx) => {
			const deps = ctx.meta.packageJson.data?.dependencies
			return (
				deps &&
				('typescript' in deps || '@types/node' in deps || '@types/bun' in deps)
			)
		},
		message:
			"TypeScript or @types/* packages are listed as production dependencies. Consider moving them to devDependencies since they're only needed during development.",
		logLevel: 'recommended',
	},

	{
		check: (ctx) => {
			const hasMinification =
				ctx.options.minify ||
				ctx.options.minifyWhitespace ||
				ctx.options.minifyIdentifiers ||
				ctx.options.minifySyntax
			return hasMinification && !ctx.options.sourcemap
		},
		message: `You are using minification without source maps. Consider enabling source maps to help with debugging minified code. Learn more: ${link('https://bunup.dev/docs/guide/options#source-maps')}`,
		logLevel: 'recommended',
	},

	{
		check: (ctx) => {
			const pkg = ctx.meta.packageJson.data
			return !pkg?.files && !pkg?.private
		},
		message:
			'Your package.json is missing a "files" field. This means all files will be published to npm. Consider adding a "files" field to control what gets published.',
		logLevel: 'info',
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
