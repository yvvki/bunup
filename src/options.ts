import type {
    Arrayable,
    BunBuildOptions,
    PromiseOr,
    WithRequired,
} from "./types";

export type Loader = NonNullable<BunBuildOptions["loader"]>[string];

export type Define = BunBuildOptions["define"];

export type Sourcemap = BunBuildOptions["sourcemap"];

export type Format = Exclude<BunBuildOptions["format"], undefined>;

export type Target = BunBuildOptions["target"];

export type External = (string | RegExp)[];

export type Entry = Arrayable<string> | Record<string, string>;

export type ShimOptions = {
    /**
     * Adds __dirname and __filename shims for ESM files when used
     */
    dirnameFilename?: boolean;
    /**
     * Adds import.meta.url shims for CJS files when used
     */
    importMetaUrl?: boolean;
};

export type Shims = boolean | ShimOptions;

export type DtsOptions = {
    /**
     * Entry point files for TypeScript declaration file generation
     *
     * This can be:
     * - A string path to a file
     * - An array of file paths
     * - An object where keys are output names and values are input file paths
     *
     * The key names are used for the generated declaration files.
     * For example, `{custom: 'src/index.ts'}` will generate `custom.d.ts`
     *
     * If not specified, the main entry points will be used for declaration file generation.
     *
     * If it's a string or an array of strings, the file name (without extension)
     * will be used as the name for the output declaration file.
     *
     * @example
     * // Using a string path
     * entry: 'src/index.ts' // Generates index.d.ts
     *
     * // Using string paths in an array
     * entry: ['src/index.ts']  // Generates index.d.ts
     *
     * // Using named outputs as an object
     * entry: { myModule: 'src/index.ts', utils: 'src/utility-functions.ts' } // Generates myModule.d.ts and utils.d.ts
     */
    entry?: Entry;
    /**
     * Resolve external types used in dts files from node_modules
     */
    resolve?: boolean | (string | RegExp)[];
};

export interface BuildOptions {
    /**
     * Name of the build configuration
     * Used for logging and identification purposes
     */
    name?: string;

    /**
     * Entry point files for the build
     *
     * This can be:
     * - A string path to a file
     * - An array of file paths
     * - An object where keys are output names and values are input file paths
     *
     * The key names are used for the generated output files.
     * For example, `{custom: 'src/index.ts'}` will generate `custom.js`
     *
     * If it's a string or an array of strings, the file name (without extension)
     * will be used as the name for the output file.
     *
     * @example
     * // Using a string path
     * entry: 'src/index.ts' // Generates index.js
     *
     * // Using string paths in an array
     * entry: ['src/index.ts']  // Generates index.js
     *
     * // Using named outputs as an object
     * entry: { myModule: 'src/index.ts', utils: 'src/utility-functions.ts' } // Generates myModule.js and utils.js
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
     * Defaults to ['cjs'] if not specified
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
     * Generate only TypeScript declaration files (.d.ts) without any JavaScript output
     * When set to true, bunup will skip the JavaScript bundling process entirely
     * and only generate declaration files for the specified entry points
     *
     * This is useful when you want to use bunup's fast declaration file generation
     * but handle the JavaScript bundling separately or not at all.
     *
     * Note: When this option is true, the `dts` option is implicitly set to true
     * and other bundling-related options are ignored.
     *
     * @example
     * dtsOnly: true
     */
    dtsOnly?: boolean;

    /**
     * Path to a preferred tsconfig.json file to use for declaration generation
     *
     * If not specified, the tsconfig.json in the project root will be used.
     * This option allows you to use a different TypeScript configuration
     * specifically for declaration file generation.
     *
     * @example
     * preferredTsconfigPath: './tsconfig.build.json'
     */
    preferredTsconfigPath?: string;

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
    /**
     * Specifies the type of sourcemap to generate
     * Can be 'none', 'linked', 'external', or 'inline'
     * Can also be a boolean - when true, it will use 'inline'
     *
     * @see https://bun.sh/docs/bundler#sourcemap
     *
     * @default 'none'
     *
     * @example
     * sourcemap: 'linked'
     * // or
     * sourcemap: true // equivalent to 'inline'
     */
    sourcemap?: Sourcemap;
    /**
     * Define global constants for the build
     * These values will be replaced at build time
     *
     * @see https://bun.sh/docs/bundler#define
     *
     * @example
     * define: {
     *   'process.env.NODE_ENV': '"production"',
     *   'PACKAGE_VERSION': '"1.0.0"'
     * }
     */
    define?: Define;
    /**
     * A callback function that runs after the build process completes
     * This can be used for custom post-build operations like copying files,
     * running additional tools, or logging build information
     *
     * If watch mode is enabled, this callback runs after each rebuild
     */
    onBuildSuccess?: () => PromiseOr<void>;
    /**
     * A banner to be added to the final bundle, this can be a directive like "use client" for react or a comment block such as a license for the code.
     *
     * @see https://bun.sh/docs/bundler#banner
     *
     * @example
     * banner: '"use client";'
     */
    banner?: string;
    /**
     * A footer to be added to the final bundle, this can be something like a comment block for a license or just a fun easter egg.
     *
     * @see https://bun.sh/docs/bundler#footer
     *
     * @example
     * footer: '// built with love in SF'
     */
    footer?: string;
    /**
     * Remove function calls from a bundle. For example, `drop: ["console"]` will remove all calls to `console.log`. Arguments to calls will also be removed, regardless of if those arguments may have side effects. Dropping `debugger` will remove all `debugger` statements.
     *
     * @see https://bun.sh/docs/bundler#drop
     *
     * @example
     * drop: ["console", "debugger", "anyIdentifier.or.propertyAccess"]
     */
    drop?: string[];
    /**
     * A map of file extensions to [built-in loader names](https://bun.sh/docs/bundler/loaders#built-in-loaders). This can be used to quickly customize how certain files are loaded.
     *
     * @see https://bun.sh/docs/bundler#loader
     *
     * @example
     * loader: {
     *   ".png": "dataurl",
     *   ".txt": "file",
     * }
     */
    loader?: Record<string, Loader>;
    /**
     * Generate bytecode for the output. This can dramatically improve cold start times, but will make the final output larger and slightly increase memory usage.
     *
     * Bytecode is currently only supported for CommonJS (format: "cjs").
     *
     * Must be target: "bun"
     *
     * @see https://bun.sh/docs/bundler#bytecode
     *
     * @default false
     */
    bytecode?: boolean;
    /**
     * Disable logging during the build process. When set to true, no logs will be printed to the console.
     *
     * @default false
     */
    silent?: boolean;
    /**
     * You can specify a prefix to be added to specific import paths in your bundled code
     *
     * Used for assets, external modules, and chunk files when splitting is enabled
     *
     * @see https://bunup.arshadyaseen.com/#public-path for more information
     *
     * @example
     * publicPath: 'https://cdn.example.com/'
     */
    publicPath?: string;

    /**
     * Inject Node.js compatibility shims for ESM/CJS interoperability
     *
     * When set to true, automatically injects all shims when needed
     * When set to an object, only injects the specified shims
     *
     * Available shims:
     * - dirnameFilename: Adds __dirname and __filename for ESM files when used
     * - importMetaUrl: Adds import.meta.url for CJS files when used
     *
     * @example
     * // Enable all shims
     * shims: true
     *
     * // Enable only specific shims
     * shims: { dirnameFilename: true, importMetaUrl: true }
     */
    shims?: Shims;
}

export type CliOptions = BuildOptions & { config: string };

export const DEFAULT_OPTIONS: WithRequired<BuildOptions, "clean"> = {
    entry: [],
    format: ["cjs"],
    outDir: "dist",
    target: "node",
    clean: true,
};

export function createBuildOptions(
    partialOptions: Partial<BuildOptions>,
): BuildOptions {
    return {
        ...DEFAULT_OPTIONS,
        ...partialOptions,
    };
}
export function getResolvedMinify(options: BuildOptions): {
    whitespace: boolean;
    identifiers: boolean;
    syntax: boolean;
} {
    const { minify, minifyWhitespace, minifyIdentifiers, minifySyntax } =
        options;
    const defaultValue = minify === true;

    return {
        whitespace: minifyWhitespace ?? defaultValue,
        identifiers: minifyIdentifiers ?? defaultValue,
        syntax: minifySyntax ?? defaultValue,
    };
}

export function getResolvedBytecode(
    bytecode: boolean | undefined,
    format: Format,
): boolean | undefined {
    return format === "cjs" ? bytecode : undefined;
}

export function getResolvedDefine(
    define: Define | undefined,
    shims: Shims | undefined,
    format: Format,
): Record<string, string> | undefined {
    return {
        ...define,
        ...(format === "cjs" &&
            (shims === true ||
                (typeof shims === "object" && shims.importMetaUrl)) && {
                "import.meta.url": "importMetaUrl",
            }),
    };
}

// If splitting is undefined, it will be true if the format is esm
export function getResolvedSplitting(
    splitting: boolean | undefined,
    format: Format,
): boolean {
    return splitting === undefined ? format === "esm" : splitting;
}
