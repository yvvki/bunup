type Bun = typeof import('bun');

export type BunBuildOptions = Parameters<Bun['build']>[0];

export type Format = 'esm' | 'cjs' | 'iife';
export type Target = 'bun' | 'node' | 'browser';

export interface DtsOptions {
    /**
     * Entry files to generate declsaration files for
     * If not specified, the main entry points will be used
     */
    entry?: string[];

    /**
     * Path to a specific tsconfig.json file to use for declaration generation
     * If not specified, the default tsconfig.json will be used
     */
    preferredTsconfigPath?: string;
}

export interface BunupOptions {
    /**
     * Entry point files for the build
     * These are the files that will be processed and bundled
     */
    entry: string[];

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
     * Can be a boolean or a DtsOptions object for more control
     */
    dts?: boolean | DtsOptions;

    /**
     * External packages that should not be bundled
     * Useful for dependencies that should be kept as external imports
     */
    external?: string[];
    /**
     * The target environment for the bundle
     * Can be 'browser', 'bun', 'node', etc.
     * Defaults to 'node' if not specified
     */
    target?: Target;
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
};

export function createBunBuildOptions(
    options: BunupOptions,
    rootDir: string,
): BunBuildOptions {
    return {
        entrypoints: options.entry.map(e => `${rootDir}/${e}`),
        outdir: `${rootDir}/${options.outDir}`,
        format: options.format[0],
        minify: createMinifyOptions(options),
        target: options.target,
        external: options.external || ['node_modules/*'],
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
