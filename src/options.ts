export type Format = 'esm' | 'cjs';

type Bun = typeof import('bun');

export type BunBuildOptions = Parameters<Bun['build']>[0];

export interface DtsOptions {
    entry?: string[];
    preferredTsconfigPath?: string;
}

export interface BunupOptions {
    entry: string[];
    outdir?: string;
    format: Format[];
    minify?: boolean;
    minifyWhitespace?: boolean;
    minifyIdentifiers?: boolean;
    minifySyntax?: boolean;
    watch?: boolean;
    dts?: boolean | DtsOptions;
    external?: string[];
}

export const DEFAULT_OPTIONS: Partial<BunupOptions> = {
    entry: [],
    format: ['esm'],
    outdir: 'dist',
    minify: false,
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false,
    watch: false,
    dts: false,
    external: [],
};

export const createBunBuildOptions = (
    options: BunupOptions,
    rootDir: string,
): BunBuildOptions => {
    return {
        entrypoints: options.entry.map(e => `${rootDir}/${e}`),
        outdir: `${rootDir}/${options.outdir}`,
        format: options.format[0],
        minify: createMinifyOptions(options),
        external: options.external || ['node_modules/*'],
    };
};

function createMinifyOptions(options: BunupOptions) {
    if (options.minify === true) {
        return {
            whitespace: true,
            identifiers: true,
            syntax: true,
        };
    }

    return {
        whitespace: options.minifyWhitespace ?? false,
        identifiers: options.minifyIdentifiers ?? false,
        syntax: options.minifySyntax ?? false,
    };
}
