declare const Bun: typeof import("bun");

export type Format = "esm" | "cjs" | "iife";

export type BunBuildOptions = Parameters<typeof Bun.build>[0];

export interface BunupOptions {
  entry: string[];
  format: Format[];
  outdir: string;
  minify?: boolean;
  minifyWhitespace?: boolean;
  minifyIdentifiers?: boolean;
  minifySyntax?: boolean;
  watch?: boolean;
  dts?: boolean;
  external?: string[];
}

export const DEFAULT_OPTIONS: BunupOptions = {
  entry: ["src/index.ts"],
  format: ["esm"],
  outdir: "dist",
  minify: false,
  minifyIdentifiers: false,
  minifySyntax: false,
  minifyWhitespace: false,
  watch: false,
  dts: false,
  external: [],
};

export const createBuildOptions = (
  options: BunupOptions,
  rootDir: string,
): BunBuildOptions => {
  return {
    entrypoints: options.entry.map((e) => `${rootDir}/${e}`),
    outdir: `${rootDir}/${options.outdir}`,
    format: options.format[0],
    minify: createMinifyOptions(options),
    external: options.external || ["node_modules/*"],
  };
};

function createMinifyOptions(options: BunupOptions) {
  return {
    whitespace:
      options.minifyWhitespace !== undefined
        ? options.minifyWhitespace
        : (options.minify ?? false),
    identifiers:
      options.minifyIdentifiers !== undefined
        ? options.minifyIdentifiers
        : (options.minify ?? false),
    syntax:
      options.minifySyntax !== undefined
        ? options.minifySyntax
        : (options.minify ?? false),
  };
}
