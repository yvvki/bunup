import {BunBuildOptions} from './types';

export type Format = 'esm' | 'cjs' | 'iife';
export type Target = 'bun' | 'node' | 'browser';
export type External = string[];

export type Entry = string[] | Record<string, string>;

export type DtsOptions = {
    /**
     * Entry point files for TypeScript declaration file generation
     *
     * This can be:
     * - An array of file paths
     * - An object where keys are output names and values are input file paths
     *
     * The key names are used for the generated declaration files.
     * For example, {custom: './src/index.ts'} will generate custom.d.ts
     *
     * If not specified, the main entry points will be used for declaration file generation.
     *
     * If a string path is provided in an array, the file name (without extension)
     * will be used as the name for the output declaration file.
     *
     * @example
     * // Using string paths in an array
     * entry: ['./src/index.ts']  // Generates index.d.ts
     *
     * // Using named outputs as an object
     * entry: { myModule: './src/index.ts', utils: './src/utility-functions.ts' } // Generates myModule.d.ts and utils.d.ts
     */
    entry: Entry;
};

export interface BunupOptions {
    /**
     * Name of the build configuration
     * Used for logging and identification purposes
     */
    name?: string;

    /**
     * Entry point files for the build
     *
     * This can be:
     * - An array of file paths
     * - An object where keys are output names and values are input file paths
     *
     * The key names are used for the generated output files.
     * For example, {custom: './src/index.ts'} will generate custom.js
     *
     * If a string path is provided in an array, the file name (without extension)
     * will be used as the name for the output file.
     *
     * @example
     * // Using string paths in an array
     * entry: ['./src/index.ts']  // Generates index.js
     *
     * // Using named outputs as an object
     * entry: { myModule: './src/index.ts', utils: './src/utility-functions.ts' } // Generates myModule.js and utils.js
     */
    entry: Entry;

    /**
     * Output directory for the bundled files
     * Defaults to 'dist' if not specified
     */
    outDir: string;

    /**
     * Output formats for the bundle
     * Can include 'esm', 'cjs', and/or 'iife'
     * Defaults to ['esm'] if not specified
     */
    format: Format[];

    /**
     * Whether to enable all minification options
     * When true, enables minifyWhitespace, minifyIdentifiers, and minifySyntax
     */
    minify?: boolean;

    /**
     * Whether to enable code splitting
     * Defaults to true for ESM format, false for CJS format
     */
    splitting?: boolean;

    /**
     * Whether to minify whitespace in the output
     * Removes unnecessary whitespace to reduce file size
     */
    minifyWhitespace?: boolean;

    /**
     * Whether to minify identifiers in the output
     * Renames variables and functions to shorter names
     */
    minifyIdentifiers?: boolean;

    /**
     * Whether to minify syntax in the output
     * Optimizes code structure for smaller file size
     */
    minifySyntax?: boolean;

    /**
     * Whether to watch for file changes and rebuild automatically
     */
    watch?: boolean;

    /**
     * Whether to generate TypeScript declaration files (.d.ts)
     * When set to true, generates declaration files for all entry points
     * Can also be configured with DtsOptions for more control
     */
    dts?: boolean | DtsOptions;

    /**
     * External packages that should not be bundled
     * Useful for dependencies that should be kept as external imports
     */
    external?: External;

    /**
     * Packages that should be bundled even if they are in external
     * Useful for dependencies that should be included in the bundle
     */
    noExternal?: External;

    /**
     * The target environment for the bundle
     * Can be 'browser', 'bun', 'node', etc.
     * Defaults to 'node' if not specified
     */
    target?: Target;

    /**
     * Whether to clean the output directory before building
     * When true, removes all files in the outDir before starting a new build
     * Defaults to true if not specified
     */
    clean?: boolean;
}

export const DEFAULT_OPTIONS: Partial<BunupOptions> = {
    entry: [],
    format: ['esm'],
    outDir: 'dist',
    minify: false,
    watch: false,
    dts: false,
    target: 'node',
    external: [],
    clean: true,
};

export function createDefaultBunBuildOptions(
    options: BunupOptions,
    rootDir: string,
): Omit<BunBuildOptions, 'entrypoints'> {
    return {
        outdir: `${rootDir}/${options.outDir}`,
        minify: createMinifyOptions(options),
        target: options.target,
        splitting: options.splitting,
    };
}

function createMinifyOptions(options: BunupOptions): {
    whitespace: boolean;
    identifiers: boolean;
    syntax: boolean;
} {
    const {minify, minifyWhitespace, minifyIdentifiers, minifySyntax} = options;
    const defaultValue = minify === true;

    return {
        whitespace: minifyWhitespace ?? defaultValue,
        identifiers: minifyIdentifiers ?? defaultValue,
        syntax: minifySyntax ?? defaultValue,
    };
}
