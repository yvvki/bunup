import type { PackageJson } from '../loaders'
import type { BuildOptions, Format } from '../options'
import type { BunPlugin, MaybePromise } from '../types'

/**
 * Represents a Bun plugin that can be used with Bunup
 */
export type BunupBunPlugin = {
	/** Identifies this as a native Bun plugin */
	type: 'bun'
	/** Optional name for the plugin */
	name?: string
	/** The actual Bun plugin implementation */
	plugin: BunPlugin
}

/**
 * Represents the meta data of the build
 */
export type BuildMeta = {
	/** The package.json file */
	packageJson: PackageJson
	/** The root directory of the build */
	rootDir: string
}

export type BuildOutputFile = {
	/** Path to the generated file */
	fullPath: string
	/** Path to the generated file relative to the root directory */
	relativePathToRootDir: string
	/** Whether the file is a dts file */
	dts: boolean
	/** The path to the entry file (defined in config.entry) that generated this output file */
	entry: string
	/**
	 * The base path of the output file relative to the output directory, excluding the extension.
	 * Examples:
	 * - If the entry is "src/client/index.ts", the outputBasePath will be "client/index"
	 * - If the entry is "src/index.ts", the outputBasePath will be "index"
	 */
	outputBasePath: string
	/** The format of the output file */
	format: Format
}

/**
 * Represents the output of a build operation
 */
export type BuildOutput = {
	/** Array of generated files with their paths and contents */
	files: BuildOutputFile[]
}

/**
 * Context provided to build hooks
 */
export type BuildContext = {
	/** The build options that were used */
	options: BuildOptions
	/** The output of the build */
	output: BuildOutput
	/** The meta data of the build */
	meta: BuildMeta
}

/**
 * Hooks that can be implemented by Bunup plugins
 */
export type BunupPluginHooks = {
	/**
	 * Called when a build is successfully completed
	 * @param ctx Build context containing options and output
	 */
	onBuildDone?: (ctx: BuildContext) => MaybePromise<void>

	/**
	 * Called before a build starts
	 * @param options Build options that will be used
	 */
	onBuildStart?: (options: BuildOptions) => MaybePromise<void>
}

/**
 * Represents a Bunup-specific plugin
 */
export type BunupPlugin = {
	/** Identifies this as a Bunup-specific plugin */
	type: 'bunup'
	/** Optional name for the plugin */
	name?: string
	/** The hooks implemented by this plugin */
	hooks: BunupPluginHooks
}

/**
 * Union type representing all supported plugin types
 */
export type Plugin = BunupBunPlugin | BunupPlugin
