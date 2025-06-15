import pc from 'picocolors'
import { version } from '../../package.json'
import { BUNUP_DOCS_URL } from '../constants'
import { BunupCLIError } from '../errors'
import { logger } from '../logger'
import type { BuildOptions } from '../options'

export type CliOptions = BuildOptions & {
	/**
	 * Path to a specific configuration file to use instead of the default bunup.config.ts.
	 *
	 * @example
	 * bunup src/index.ts --config=./bunup.config.ts
	 */
	config: string
	/**
	 * Command to execute after a successful build.
	 * This command will be run when the build process completes without errors.
	 *
	 * @example
	 * bunup src/index.ts --onSuccess="echo 'Build successful'"
	 */
	onSuccess?: string
	/**
	 * Filter specific packages to build in a workspace.
	 * This option is only relevant when using bunup workspaces.
	 *
	 * @example
	 * bunup --filter core,utils
	 */
	filter?: string[]
	/**
	 * Create a new project with bunup.
	 *
	 * @example
	 * bunup --new
	 */
	new?: boolean
	/**
	 * Initialize bunup in an existing project.
	 *
	 * @example
	 * bunup --init
	 */
	init?: boolean
}

type OptionHandler = (
	value: string | boolean,
	options: Partial<CliOptions>,
	subPath?: string,
) => void

interface OptionConfig {
	flags: string[]
	handler: OptionHandler
	description: string
	type: 'string' | 'boolean' | 'array' | 'string|boolean'
	default?: string
	category:
		| 'build'
		| 'output'
		| 'development'
		| 'minification'
		| 'workspace'
		| 'utility'
}

function booleanHandler(optionName: keyof CliOptions): OptionHandler {
	return (value, options) => {
		options[optionName] = (value === true || value === 'true') as any
	}
}

function stringHandler(optionName: keyof CliOptions): OptionHandler {
	return (value, options) => {
		if (typeof value === 'string') {
			options[optionName] = value as any
		} else {
			throw new BunupCLIError(`Option --${optionName} requires a string value`)
		}
	}
}

function arrayHandler(optionName: keyof CliOptions): OptionHandler {
	return (value, options) => {
		if (typeof value === 'string') {
			options[optionName] = value.split(',') as any
		} else {
			throw new BunupCLIError(`Option --${optionName} requires a string value`)
		}
	}
}

function booleanOrStringHandler(optionName: keyof CliOptions): OptionHandler {
	return (value, options) => {
		if (typeof value === 'boolean') {
			options[optionName] = value as any
		} else if (typeof value === 'string') {
			if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
				options[optionName] = (value.toLowerCase() === 'true') as any
			} else {
				options[optionName] = value as any
			}
		} else {
			throw new BunupCLIError(
				`Option --${optionName} requires a boolean or string value`,
			)
		}
	}
}

function showHelp(): void {
	console.log()
	console.log(pc.cyan(pc.bold('bunup')))
	console.log()
	console.log('⚡️ A blazing-fast build tool for your libraries built with Bun')
	console.log()

	console.log(pc.cyan('Usage:'))
	console.log('  bunup [entry...] [options]')
	console.log('  bunup --init')
	console.log('  bunup --new')
	console.log()

	const categories = {
		build: 'Build Options',
		output: 'Output Options',
		development: 'Development Options',
		minification: 'Minification Options',
		workspace: 'Workspace Options',
		utility: 'Utility Options',
	}

	for (const [categoryKey, categoryName] of Object.entries(categories)) {
		const categoryOptions = Object.entries(optionConfigs).filter(
			([_, config]) => config.category === categoryKey,
		)

		if (categoryOptions.length === 0) continue

		console.log(pc.cyan(`${categoryName}:`))

		for (const [_, config] of categoryOptions) {
			const flags = config.flags
				.map((flag) => (flag.length === 1 ? `-${flag}` : `--${flag}`))
				.join(', ')

			const flagsDisplay = pc.green(flags)
			const typeDisplay = pc.dim(`<${config.type}>`)
			const defaultDisplay = config.default
				? pc.yellow(`(default: ${config.default})`)
				: ''

			console.log(`  ${flagsDisplay} ${typeDisplay}`)
			console.log(`    ${pc.dim(config.description)} ${defaultDisplay}`)
			console.log()
		}
	}

	console.log(pc.cyan('Examples:'))
	console.log('  bunup src/**/*.ts')
	console.log('  bunup src/index.ts src/cli.ts --format esm,cjs')
	console.log('  bunup src/index.ts --watch --dts')

	console.log()

	console.log(pc.dim('For more information:'))
	console.log(`  ${pc.cyan(pc.underline(BUNUP_DOCS_URL))}`)
	console.log()

	process.exit(0)
}

function showVersion(): void {
	console.log(version)
	process.exit(0)
}

const optionConfigs: Record<string, OptionConfig> = {
	name: {
		flags: ['n', 'name'],
		handler: stringHandler('name'),
		description:
			'Name of the build configuration for logging and identification',
		type: 'string',
		category: 'utility',
	},
	format: {
		flags: ['f', 'format'],
		handler: arrayHandler('format'),
		description: 'Output formats for the bundle (esm, cjs, iife)',
		type: 'array',
		default: 'cjs',
		category: 'build',
	},
	outDir: {
		flags: ['o', 'out-dir'],
		handler: stringHandler('outDir'),
		description: 'Output directory for the bundled files',
		type: 'string',
		default: 'dist',
		category: 'output',
	},
	minify: {
		flags: ['m', 'minify'],
		handler: booleanHandler('minify'),
		description: 'Enable all minification options',
		type: 'boolean',
		category: 'minification',
	},
	watch: {
		flags: ['w', 'watch'],
		handler: booleanHandler('watch'),
		description: 'Watch for file changes and rebuild automatically',
		type: 'boolean',
		category: 'development',
	},
	dts: {
		flags: ['d', 'dts'],
		handler: booleanHandler('dts'),
		description: 'Generate TypeScript declaration files (.d.ts)',
		type: 'boolean',
		category: 'development',
	},
	banner: {
		flags: ['bn', 'banner'],
		handler: stringHandler('banner'),
		description: 'A banner to be added to the final bundle',
		type: 'string',
		category: 'output',
	},
	footer: {
		flags: ['ft', 'footer'],
		handler: stringHandler('footer'),
		description: 'A footer to be added to the final bundle',
		type: 'string',
		category: 'output',
	},
	external: {
		flags: ['e', 'external'],
		handler: arrayHandler('external'),
		description: 'External packages that should not be bundled',
		type: 'array',
		category: 'build',
	},
	sourcemap: {
		flags: ['sm', 'sourcemap'],
		handler: booleanOrStringHandler('sourcemap'),
		description:
			'Type of sourcemap to generate (none, linked, external, inline)',
		type: 'string|boolean',
		default: 'none',
		category: 'output',
	},
	target: {
		flags: ['t', 'target'],
		handler: stringHandler('target'),
		description: 'The target environment for the bundle',
		type: 'string',
		default: 'node',
		category: 'build',
	},
	minifyWhitespace: {
		flags: ['mw', 'minify-whitespace'],
		handler: booleanHandler('minifyWhitespace'),
		description: 'Minify whitespace in the output',
		type: 'boolean',
		category: 'minification',
	},
	minifyIdentifiers: {
		flags: ['mi', 'minify-identifiers'],
		handler: booleanHandler('minifyIdentifiers'),
		description: 'Minify identifiers in the output',
		type: 'boolean',
		category: 'minification',
	},
	minifySyntax: {
		flags: ['ms', 'minify-syntax'],
		handler: booleanHandler('minifySyntax'),
		description: 'Minify syntax in the output',
		type: 'boolean',
		category: 'minification',
	},
	clean: {
		flags: ['c', 'clean'],
		handler: booleanHandler('clean'),
		description: 'Clean the output directory before building',
		type: 'boolean',
		default: 'true',
		category: 'output',
	},
	splitting: {
		flags: ['s', 'splitting'],
		handler: booleanHandler('splitting'),
		description: 'Enable code splitting',
		type: 'boolean',
		category: 'build',
	},
	noExternal: {
		flags: ['ne', 'no-external'],
		handler: arrayHandler('noExternal'),
		description: 'Packages that should be bundled even if they are in external',
		type: 'array',
		category: 'build',
	},
	preferredTsconfigPath: {
		flags: ['preferred-tsconfig-path'],
		handler: stringHandler('preferredTsconfigPath'),
		description:
			'Path to a preferred tsconfig.json file for declaration generation',
		type: 'string',
		category: 'development',
	},
	bytecode: {
		flags: ['bc', 'bytecode'],
		handler: booleanHandler('bytecode'),
		description: 'Generate bytecode for the output (CJS only)',
		type: 'boolean',
		default: 'false',
		category: 'output',
	},
	silent: {
		flags: ['silent'],
		handler: booleanHandler('silent'),
		description: 'Disable logging during the build process',
		type: 'boolean',
		default: 'false',
		category: 'utility',
	},
	config: {
		flags: ['config'],
		handler: stringHandler('config'),
		description: 'Path to a specific configuration file to use',
		type: 'string',
		category: 'utility',
	},
	publicPath: {
		flags: ['pp', 'public-path'],
		handler: stringHandler('publicPath'),
		description: 'Prefix to be added to specific import paths in bundled code',
		type: 'string',
		category: 'output',
	},
	env: {
		flags: ['env'],
		handler: stringHandler('env'),
		description:
			'Controls how environment variables are handled during bundling',
		type: 'string',
		category: 'build',
	},
	onSuccess: {
		flags: ['onSuccess'],
		handler: stringHandler('onSuccess'),
		description: 'Command to execute after a successful build',
		type: 'string',
		category: 'development',
	},
	filter: {
		flags: ['filter'],
		handler: arrayHandler('filter'),
		description: 'Filter specific packages to build in a workspace',
		type: 'array',
		category: 'workspace',
	},
	new: {
		flags: ['new'],
		handler: booleanHandler('new'),
		description: 'Create a new project with bunup',
		type: 'boolean',
		category: 'utility',
	},
	init: {
		flags: ['init'],
		handler: booleanHandler('init'),
		description: 'Initialize bunup in an existing project',
		type: 'boolean',
		category: 'utility',
	},
	entry: {
		flags: ['entry'],
		handler: (
			value: string | boolean,
			options: Partial<CliOptions>,
			subPath?: string,
		) => {
			if (typeof value !== 'string') {
				throw new BunupCLIError(
					`Entry${subPath ? ` --entry.${subPath}` : ''} requires a string value`,
				)
			}
			const entries = Array.isArray(options.entry) ? [...options.entry] : []
			if (subPath) {
				logger.warn(
					`Subpath '${subPath}' provided via --entry.${subPath}, but object entry format is not supported. Adding entry as string.`,
				)
			}
			if (entries.includes(value)) {
				logger.warn(`Duplicate entry '${value}' provided. Skipping.`)
			} else {
				entries.push(value)
			}
			options.entry = entries
		},
		description: 'Entry point files for the build',
		type: 'string',
		category: 'build',
	},
	resolveDts: {
		flags: ['rd', 'resolve-dts'],
		handler: (value: string | boolean, options: Partial<CliOptions>) => {
			if (!options.dts) options.dts = {}
			if (typeof options.dts === 'boolean') options.dts = {}
			if (typeof value === 'string') {
				if (value === 'true' || value === 'false') {
					;(options.dts as any).resolve = value === 'true'
				} else {
					;(options.dts as any).resolve = value.split(',')
				}
			} else {
				;(options.dts as any).resolve = true
			}
		},
		description: 'Configure DTS resolution options',
		type: 'string|boolean',
		category: 'development',
	},
	help: {
		flags: ['h', 'help'],
		handler: () => showHelp(),
		description: 'Show this help message',
		type: 'boolean',
		category: 'utility',
	},
	version: {
		flags: ['v', 'version'],
		handler: () => showVersion(),
		description: 'Show version number',
		type: 'boolean',
		category: 'utility',
	},
}

const flagToHandler: Record<string, OptionHandler> = {}
for (const config of Object.values(optionConfigs)) {
	for (const flag of config.flags) {
		flagToHandler[flag] = config.handler
	}
}

export function parseCliOptions(argv: string[]): Partial<CliOptions> {
	const options: Partial<CliOptions> = {}
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i]
		if (arg.startsWith('--')) {
			let key: string
			let value: string | boolean
			if (arg.includes('=')) {
				const [keyPart, valuePart] = arg.slice(2).split('=', 2)
				key = keyPart
				value = valuePart
			} else {
				key = arg.slice(2)
				const nextArg = argv[i + 1]
				value = nextArg && !nextArg.startsWith('-') ? nextArg : true
				if (typeof value === 'string') i++
			}
			if (key.includes('.')) {
				const [mainOption, subPath] = key.split('.', 2)
				const handler = flagToHandler[mainOption]
				if (handler) {
					handler(value, options, subPath)
				} else {
					throw new BunupCLIError(`Unknown option: --${key}`)
				}
			} else {
				const handler = flagToHandler[key]
				if (handler) {
					handler(value, options)
				} else {
					throw new BunupCLIError(`Unknown option: --${key}`)
				}
			}
		} else if (arg.startsWith('-')) {
			const key = arg.slice(1)
			const nextArg = argv[i + 1]
			const value = nextArg && !nextArg.startsWith('-') ? nextArg : true
			if (typeof value === 'string') i++
			const handler = flagToHandler[key]
			if (handler) {
				handler(value, options)
			} else {
				throw new BunupCLIError(`Unknown option: -${key}`)
			}
		} else {
			optionConfigs.entry.handler(arg, options, undefined)
		}
	}
	return options
}
