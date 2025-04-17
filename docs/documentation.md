# Introduction

Bunup is the **high-performance build tool** for TypeScript and JavaScript libraries, with **first-class support** for libraries built with [Bun](https://bun.sh/). It delivers **lightning-fast builds** — up to **~50x faster than Tsup**.

## What Can It Bundle?

Bunup handles JavaScript/TypeScript files, JSON, TOML, text files, and various assets. File processing can be customized with the [loader](https://bunup.arshadyaseen.com/documentation/#custom-loaders) option.

## Quick Start

Get started with Bunup in seconds - install, configure, and build your TypeScript/JavaScript projects with minimal setup.

### Installation

::: code-group

```sh [bun]
bun add --dev bunup
```

```sh [pnpm]
pnpm add --save-dev bunup
```

```sh [npm]
npm install --save-dev bunup
```

```sh [yarn]
yarn add --dev bunup
```

:::

### Basic Usage

Create a simple TypeScript file:

```typescript [src/index.ts]
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

Bundle it with bunup:

```sh
bunup src/index.ts
```

This will create a bundled output in the `dist` directory with CommonJS format (the default).

### Using with package.json

Add a build script to your `package.json`:

```json [package.json]
{
  "name": "my-package",
  "scripts": {
    "build": "bunup src/index.ts --format esm,cjs --dts"
  }
}
```

Then run:

```sh
npm run build
```

### Configuration File

Create a `bunup.config.ts` file for more control:

```typescript [bunup.config.ts]
import { defineConfig } from "bunup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  minify: true,
});
```

## Configuration

Bunup offers flexible configuration options to customize your build process. You can configure Bunup through a configuration file or command-line arguments.

### Configuration File

Bunup supports configuration files in multiple formats:

- `bunup.config.ts`
- `bunup.config.js`
- `bunup.config.mjs`
- `bunup.config.cjs`

```typescript [bunup.config.ts]
import { defineConfig } from "bunup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  minify: true,
});
```

You can also export an array of configurations:

```typescript [bunup.config.ts]
export default defineConfig([
  {
    name: "node",
    entry: ["src/index.ts"],
    format: ["cjs"],
    target: "node",
  },
  {
    name: "browser",
    entry: ["src/index.ts"],
    format: ["esm", "iife"],
    target: "browser",
  },
]);
```

## CLI Options

Bunup supports various command-line options:

| Option                             | Alias       | Description                                                                                        | Default          |
| ---------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- | ---------------- |
| `--entry <path>`                   |             | Entry file path                                                                                    | `[]`             |
| `--entry.<name> <path>`            |             | Named entry file path                                                                              | -                |
| `--out-dir <dir>`                  | `-o`        | Output directory                                                                                   | `dist`           |
| `--format <formats>`               | `-f`        | Output formats (comma-separated: esm,cjs,iife)                                                     | `cjs`            |
| `--minify`                         | `-m`        | Enable all minification options                                                                    | `false`          |
| `--minify-whitespace`              | `-mw`       | Minify whitespace                                                                                  | `false`          |
| `--minify-identifiers`             | `-mi`       | Minify identifiers                                                                                 | `false`          |
| `--minify-syntax`                  | `-ms`       | Minify syntax                                                                                      | `false`          |
| `--watch`                          | `-w`        | Watch mode                                                                                         | `false`          |
| `--dts`                            | `-d`        | Generate TypeScript declarations                                                                   | `false`          |
| `--external <deps>`                | `-e`        | External dependencies (comma-separated)                                                            | `[]`             |
| `--no-external <deps>`             | `-ne`       | Force include dependencies (comma-separated)                                                       | -                |
| `--target <target>`                | `-t`        | Target environment (node, browser, bun)                                                            | `node`           |
| `--clean`                          | `-c`        | Clean output directory before build                                                                | `true`           |
| `--splitting`                      | `-s`        | Enable code splitting                                                                              | Format dependent |
| `--sourcemap <type>`               | `-sm`       | Sourcemap generation (none,linked,external,inline)                                                 | `none`           |
| `--banner <text>`                  | `-bn`       | Text to add at the beginning of output files                                                       | -                |
| `--footer <text>`                  | `-ft`       | Text to add at the end of output files                                                             | -                |
| `--public-path <url>`              | `-pp`       | Prefix to be appended to import paths in bundled code                                              | -                |
| `--name <name>`                    | `-n`        | Name for this build configuration                                                                  | -                |
| `--resolve-dts <value>`            | `-rd`       | Resolve external types for declaration files (can be boolean flag or comma-separated package list) | `false`          |
| `--dts-only`                       | `-do`       | Generate only TypeScript declaration files without JavaScript output                               | `false`          |
| `--preferred-tsconfig-path <path>` | `-tsconfig` | Path to preferred tsconfig file used for typescript declaration files generation                   | -                |
| `--bytecode`                       | `-bc`       | Generate bytecode for JavaScript/TypeScript entrypoints to improve startup times                   | `false`          |
| `--silent`                         |             | Disable logging during the build process                                                           | `false`          |
| `--shims`                          |             | Inject Node.js compatibility shims for ESM/CJS interoperability                                    | `false`          |
| `--env <mode>`                     |             | Control environment variable handling (inline, disable or PREFIX\_\*)                              | -                |
| `--config <path>`                  |             | Specify a custom path to the configuration file                                                    | -                |
| `--onSuccess <command>`            |             | Command to execute after a successful build                                                        | -                |
| `--version`                        | `-v`        | Display version information                                                                        | -                |
| `--help`                           | `-h`        | Display help information                                                                           | -                |

## Entry Points

Bunup supports multiple ways to define entry points. Entry points are the source files that Bunup will use as starting points for bundling.

### Single Entry Point

The simplest way to define an entry point is to provide a single file path:

```sh
# In CLI
bunup src/index.ts

# Configuration file
export default defineConfig({
      entry: 'src/index.ts',
});
```

This will generate an output file named after the input file (e.g., `dist/index.js`).

### Multiple Entry Points

You can specify multiple entry points in several ways:

```sh
# CLI (method 1)
bunup src/index.ts src/cli.ts

# CLI (method 2)
bunup --entry src/index.ts --entry src/cli.ts

# Configuration file
export default defineConfig({
      entry: ['src/index.ts', 'src/cli.ts'],
});
```

This will generate output files named after each input file (e.g., `dist/index.js` and `dist/cli.js`).

### Named Entries

Named entries allow you to specify custom output filenames:

```sh
# CLI
bunup --entry.main src/index.ts --entry.cli src/cli.ts

# Configuration file
export default defineConfig({
      entry: {
            main: 'src/index.ts',
            cli: 'src/cli.ts',
      },
});
```

This will generate output files with the specified names (e.g., `dist/main.js` and `dist/cli.js`).

#### Why Use Named Entries?

Named entries are useful when:

1. You want to customize the output filenames
2. Your input filenames don't match your desired output names
3. You have multiple files with the same basename in different directories
4. You want to create a specific public API structure

For example, if you have `src/utils/index.ts` and `src/components/index.ts`, using named entries prevents naming conflicts in the output.

## Output Formats

Bunup supports three output formats:

- **esm**: ECMAScript modules
- **cjs**: CommonJS modules
- **iife**: Immediately Invoked Function Expression

You can specify one or more formats:

### In the CLI

```sh
# Single format
bunup src/index.ts --format esm

# Multiple formats (comma-separated, no spaces)
bunup src/index.ts --format esm,cjs,iife
```

### In a Configuration File

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  // Single format
  format: ["esm"],

  // Or multiple formats
  // format: ['esm', 'cjs', 'iife'],
});
```

### Output File Extensions

The file extensions are determined automatically based on the format and your package.json `type` field:

**When package.json has `"type": "module"`:**

| Format | JavaScript Extension | TypeScript Declaration Extension |
| ------ | -------------------- | -------------------------------- |
| esm    | `.js`                | `.d.ts`                          |
| cjs    | `.cjs`               | `.d.cts`                         |
| iife   | `.global.js`         | `.d.ts`                          |

**When package.json has `"type": "commonjs"` or is unspecified:**

| Format | JavaScript Extension | TypeScript Declaration Extension |
| ------ | -------------------- | -------------------------------- |
| esm    | `.mjs`               | `.d.mts`                         |
| cjs    | `.js`                | `.d.ts`                          |
| iife   | `.global.js`         | `.d.ts`                          |

### Customizing Output Extensions

You can customize the output file extensions using the `outputExtension` option:

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outputExtension: ({ format, entry }) => ({
    js: entry.name === 'worker' ? '.worker.js' : `.${format}.js`,
    dts: `.${format}.d.ts`
  })
});
```

The `outputExtension` function receives:
- `format`: The output format
- `packageType`: The package.json "type" field value (typically 'module' or 'commonjs')
- `options`: The complete resolved build options object
- `entry`: The entry object containing `name` and `path` properties

It should return an object with:
- `js`: The JavaScript file extension (including the leading dot)
- `dts`: The TypeScript declaration file extension (including the leading dot)

## TypeScript Declarations

Bunup can generate TypeScript declaration files (`.d.ts`) for your code:

### Basic Declaration Generation

To generate declarations for all entry points:

```sh
# CLI
bunup src/index.ts --dts

# Configuration file
export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,
});
```

### Custom Declaration Entry Points

For more control, you can specify custom entry points for declarations:

```typescript
export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  dts: {
    // Only generate declarations for index.ts
    entry: ["src/index.ts"],
  },
});
```

### Named Declaration Entries

You can use named entries for declarations:

```typescript
export default defineConfig({
  entry: {
    main: "src/index.ts",
    cli: "src/cli.ts",
  },
  dts: {
    entry: {
      // Generate types.d.ts from index.ts
      types: "src/index.ts",
    },
  },
});
```

### Custom TypeScript Configuration

You can specify a custom tsconfig file for declaration generation:

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  preferredTsconfigPath: "./tsconfig.build.json",
});
```

### Resolving External Types

When generating declaration files, you might need to include type references from external dependencies. Bunup can automatically resolve these external types:

```sh
# CLI
bunup src/index.ts --dts --resolve-dts

# CLI (Or specify packages to resolve)
bunup src/index.ts --dts --resolve-dts=react,lodash

# Configuration file
export default defineConfig({
      entry: ['src/index.ts'],
      dts: {
            # Enable resolving all external types
            resolve: true,
      },
});
```

The `resolve` option helps when your TypeScript code imports types from external packages. Bunup will look for type definitions in `node_modules` and include them in your declaration files.

You can also specify which packages to resolve types for:

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  dts: {
    // Only resolve types from these specific packages
    resolve: ["react", "lodash", /^@types\//],
  },
});
```

### Declaration-Only Generation

If you want to generate only TypeScript declaration files without any JavaScript output, you can use the `dtsOnly` option:

```sh
# CLI
bunup src/index.ts --dts-only

# Configuration file
export default defineConfig({
      entry: ['src/index.ts'],
      dtsOnly: true,
});
```

When `dtsOnly` is set to `true`, Bunup will:

- Skip the JavaScript bundling process entirely
- Only generate declaration files for the specified entry points
- Implicitly enable the `dts` option (no need to specify both)
- Ignore other bundling-related options

This is useful when you want to use Bunup's fast declaration file generation but handle the JavaScript bundling separately or not at all.

## Named Configurations

You can give your build configurations names for better logging:

```sh
# CLI
bunup src/index.ts --name my-library

# Configuration file
export default defineConfig({
    name: 'my-library',
    entry: ['src/index.ts'],
});
```

This is especially useful when you have multiple configurations:

```typescript
export default defineConfig([
  {
    name: "node-build",
    entry: ["src/index.ts"],
    format: ["cjs"],
    target: "node",
  },
  {
    name: "browser-build",
    entry: ["src/index.ts"],
    format: ["esm", "iife"],
    target: "browser",
  },
]);
```

## External Dependencies

By default, Bunup treats all dependencies from your `package.json` (`dependencies` and `peerDependencies`) as external. This means they won't be included in your bundle.

### Specifying External Dependencies

You can explicitly mark additional packages as external:

#### In the CLI

```sh
# Single external dependency
bunup src/index.ts --external lodash

# Multiple external dependencies (comma-separated, no spaces)
bunup src/index.ts --external lodash,react,react-dom
```

#### In a Configuration File

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  external: ["lodash", "react", "@some/package"],
});
```

### Including Specific External Dependencies

You can force include specific dependencies that would otherwise be external:

#### In the CLI

```sh
bunup src/index.ts --external lodash --no-external lodash/merge
```

#### In a Configuration File

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  external: ["lodash"],
  noExternal: ["lodash/merge"], // Include lodash/merge even though lodash is external
});
```

Both `external` and `noExternal` support string patterns and regular expressions.

## Code Splitting

Code splitting allows Bunup to split your code into multiple chunks for better performance and caching.

### Default Behavior

- Code splitting is **enabled by default** for ESM format
- Code splitting is **disabled by default** for CJS and IIFE formats

### Configuring Code Splitting

You can explicitly enable or disable code splitting:

#### In the CLI

```sh
# Enable code splitting
bunup src/index.ts --splitting

# Disable code splitting
bunup src/index.ts --splitting=false
```

#### In a Configuration File

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  // Enable for all formats
  splitting: true,

  // Or disable for all formats
  // splitting: false,
});
```

## Minification

Bunup provides several minification options to reduce the size of your output files.

### Basic Minification

To enable all minification options:

```sh
# CLI
bunup src/index.ts --minify

# Configuration file
export default defineConfig({
    entry: ['src/index.ts'],
    minify: true,
});
```

### Granular Minification Control

You can configure individual minification options:

#### In the CLI

```sh
# Minify whitespace only
bunup src/index.ts --minify-whitespace

# Minify whitespace and syntax, but not identifiers
bunup src/index.ts --minify-whitespace --minify-syntax
```

#### In a Configuration File

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  // Configure individual options
  minifyWhitespace: true,
  minifyIdentifiers: false,
  minifySyntax: true,
});
```

The `minify` option is a shorthand that enables all three specific options. If you set individual options, they take precedence over the `minify` setting.

## Bytecode

Bunup can generate bytecode for your JavaScript/TypeScript entrypoints, which can significantly improve startup times for large applications.

```sh
# CLI
bunup src/index.ts --bytecode --target bun

# Configuration file
export default defineConfig({
    entry: ['src/index.ts'],
    bytecode: true,
    target: 'bun',  # Bytecode compilation requires "bun" target
});
```

For more information, see the [Bun documentation on bytecode](https://bun.sh/docs/bundler#bytecode) and [Bun's blog post on bytecode compilation](https://bun.sh/blog/bun-v1.1.30#compile-to-bytecode-for-2x-faster-startup-time).

## Source Maps

Bunup can generate source maps for your bundled code:

```sh
# CLI
bunup src/index.ts --sourcemap linked
# Or just use --sourcemap for inline source maps
bunup src/index.ts --sourcemap

# Configuration file
export default defineConfig({
    entry: ['src/index.ts'],
    sourcemap: 'linked'
    # Can also use boolean
    # sourcemap: true // equivalent to 'inline'
});
```

Available sourcemap values:

- `none`
- `linked`
- `external`
- `inline`
- `true` (equivalent to 'inline')

For detailed explanations of these values, see the [Bun documentation on source maps](https://bun.sh/docs/bundler#sourcemap).

## Define Global Constants

Bunup allows you to define global constants that will be replaced at build time. This is useful for feature flags, version numbers, or any other build-time constants.

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  define: {
    PACKAGE_VERSION: '"1.0.0"',
    DEBUG: "false",
  },
});
```

The `define` option takes an object where:

- Keys are the identifiers to replace
- Values are the strings to replace them with

For more information on how define works, see the [Bun documentation on define](https://bun.sh/docs/bundler#define).

## Banner and Footer

You can add custom text to the beginning and end of your bundle files:

```sh
# CLI
bunup src/index.ts --banner 'use client' --footer '// built with love in SF'

# Configuration file
export default defineConfig({
      entry: ['src/index.ts'],
      # Add text to the beginning of bundle files
      banner: '"use client";',
      # Add text to the end of bundle files
      footer: '// built with love in SF',
});
```

The `banner` option adds text to the beginning of the bundle, useful for directives like "use client" for React or license information.

The `footer` option adds text to the end of the bundle, which can be used for license information or other closing comments.

For more information, see the Bun documentation on [banner](https://bun.sh/docs/bundler#banner) and [footer](https://bun.sh/docs/bundler#footer).

## Drop Function Calls

You can remove specific function calls from your bundle:

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  drop: ["console", "debugger", "anyIdentifier.or.propertyAccess"],
});
```

The `drop` option removes function calls specified in the array. For example, `drop: ["console"]` will remove all calls to `console.log`. Arguments to calls will also be removed, regardless of if those arguments may have side effects. Dropping `debugger` will remove all `debugger` statements.

For more information, see the [Bun documentation on drop](https://bun.sh/docs/bundler#drop).

## Custom Loaders

You can configure how different file types are loaded:

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  loader: {
    ".png": "dataurl",
    ".txt": "file",
  },
});
```

The `loader` option takes a map of file extensions to built-in loader names, allowing you to customize how different file types are processed during bundling.

For more information, see the [Bun documentation on loaders](https://bun.sh/docs/bundler#loader).

## Custom Bun Build Plugins

You can add your own Bun bundler plugins that will be used during the build process:

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  bunBuildPlugins: [
    customTransformPlugin(),
  ],
});
```

The `bunBuildPlugins` option accepts an array of Bun plugins that will be applied during the build process. Plugins can transform code, handle different file types, and more.

For more information, see the [Bun documentation on plugins](https://bun.sh/docs/bundler/plugins).

## Public Path

You can specify a prefix to be added to specific import paths in your bundled code:

```sh
# CLI
bunup src/index.ts --public-path https://cdn.example.com/

# Configuration file
export default defineConfig({
      entry: ['src/index.ts'],
      publicPath: 'https://cdn.example.com/',
});
```

The `publicPath` option only affects certain types of imports in the final bundle:

- Asset imports (like images or SVG files)
- External modules
- Chunk files when code splitting is enabled

By default, these imports are relative. Setting `publicPath` will prefix these specific file paths with the specified value, which is useful for serving assets from a CDN.

For example:

```js [Input]
import logo from "./logo.svg";
console.log(logo);
```

```js [Output without publicPath]
var logo = "./logo-a7305bdef.svg";
console.log(logo);
```

```js [Output with publicPath]
var logo = "https://cdn.example.com/logo-a7305bdef.svg";
console.log(logo);
```

For more information, see the [Bun documentation on publicPath](https://bun.sh/docs/bundler#publicpath).

## Environment Variables

Bunup provides flexible options for handling environment variables in your bundled code:

```sh [CLI]
# Inline all environment variables available at build time
FOO=bar API_KEY=secret bunup src/index.ts --env inline

# Disable all environment variable inlining
bunup src/index.ts --env disable

# Only inline environment variables with a specific prefix (e.g., PUBLIC_)
PUBLIC_URL=https://example.com bunup src/index.ts --env PUBLIC_*
```

```typescript
export default defineConfig({
  entry: ["src/index.ts"],

  // Inline all available environment variables at build time
  env: "inline",

  // Or disable inlining entirely (keep process.env.FOO in the output)
  // env: "disable",

  // Or inline only variables that start with a specific prefix
  // env: "PUBLIC_*",

  // Or explicitly provide specific environment variables
  // These will replace both process.env.FOO and import.meta.env.FOO
  // env: {
  //   API_URL: "https://api.example.com",
  //   DEBUG: "false",
  // },
});
```

### How it Works

The `env` option controls how `process.env.*` and `import.meta.env.*` expressions are replaced at build time:

| Value            | Behavior                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `"inline"`       | Replaces all `process.env.VAR` references in your code with the actual values of those environment variables at the time of the build.                 |
| `"disable"`      | Disables environment variable replacement. Keeps `process.env.VAR` as-is in output.                                      |
| `"PREFIX_*"`     | Only inlines environment variables matching the given prefix (e.g. `PUBLIC_*`).                                          |
| `{ key: value }` | Replaces both `process.env.KEY` and `import.meta.env.KEY` with the provided values, regardless of the environment. |

For more information, see the [Bun documentation on environment variables](https://bun.sh/docs/bundler#env).

## Node.js Compatibility Shims

Bunup provides compatibility shims to help with ESM/CJS interoperability when targeting Node.js. These shims automatically add the necessary code to handle common Node.js globals across module formats.

```sh
# CLI
bunup src/index.ts --shims

# Configuration file
export default defineConfig({
      entry: ['src/index.ts'],
      format: ['esm', 'cjs'],
      # Enable all shims
      shims: true,

      # Or configure specific shims
      shims: {
            dirnameFilename: true, # Add __dirname and __filename for ESM files
            importMetaUrl: true, # Add import.meta.url for CJS files
      },
});
```

These shims are only injected when needed, based on detecting the use of these globals in your code. For example, if your ESM code uses `__dirname`, Bunup will only inject the shim for that specific file.

For example:

- For cjs output, any `import.meta.url` references are transformed to `pathToFileURL(__filename).href`
- For esm output, any `__dirname` references are transformed to `dirname(fileURLToPath(import.meta.url))`

## Watch Mode

Bunup can watch your files for changes and rebuild automatically:

```sh
bunup src/index.ts --watch
```

In watch mode, Bunup will monitor your source files and their dependencies, rebuilding only what's necessary when files change.

## Target Environments

Bunup allows you to specify the target environment for your bundle:

```sh
# CLI
bunup src/index.ts --target browser

# Configuration file
export default defineConfig({
    entry: ['src/index.ts'],
    target: 'browser',
});
```

Available targets:

- `node` (default): Optimized for Node.js
- `browser`: Optimized for browsers
- `bun`: Optimized for the Bun runtime

If a file contains a Bun shebang (`#!/usr/bin/env bun`), the `bun` target will be used automatically for that file.

## Output Directory

You can specify where Bunup should output the bundled files:

```sh
# CLI
bunup src/index.ts --out-dir build

# Configuration file
export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'build',
});
```

The default output directory is `dist`.

## Cleaning the Output Directory

By default, Bunup cleans the output directory before each build. You can disable this behavior:

```sh
# CLI
bunup src/index.ts --clean=false

# Configuration file
export default defineConfig({
    entry: ['src/index.ts'],
    clean: false,
});
```

## Post-build Operations

The `onBuildSuccess` callback runs after the build process successfully completes. This is useful for performing custom post-build operations:

```typescript
export default defineConfig({
  entry: ["src/index.ts"],
  onBuildSuccess: (options) => {
    console.log("Build completed successfully!");
    // Perform post-build operations here
    // The options parameter contains the build options that were used
  },
});
```

### Using CLI

The `onSuccess` CLI option allows you to specify a shell command that will be executed after a successful build:

```sh
bunup src/index.ts --onSuccess "echo 'Build done!' && node scripts/post-build.js"
```

## Workspaces

Bunup provides robust support for monorepo workspaces, allowing you to define build configurations for multiple packages in a single configuration file.

### Basic Workspace Configuration

To define a workspace configuration, use the `defineWorkspace` function:

```typescript
import { defineWorkspace } from "bunup";

export default defineWorkspace([
  {
    name: "core-package",
    root: "packages/core",
    config: {
      entry: ["src/index.ts"],
      format: ["esm", "cjs"],
      dts: true,
    },
  },
  {
    name: "utils-package",
    root: "packages/utils",
    config: {
      entry: ["src/index.ts"],
      format: ["esm"],
      dts: true,
    },
  },
]);
```

### Workspace Structure

Each workspace entry requires three properties:

- **name**: A unique identifier for the workspace (used in logs)
- **root**: The relative path to the workspace root directory
- **config**: The build configuration for the workspace (same options as `defineConfig`)

### Multiple Configurations per Workspace

You can define multiple build configurations for a single workspace by using an array for the `config` property:

```typescript
export default defineWorkspace([
  {
    name: "web-package",
    root: "packages/web",
    config: [
      {
        name: "esm-build",
        entry: ["src/index.ts"],
        format: ["esm"],
        target: "browser",
      },
      {
        name: "cjs-build",
        entry: ["src/index.ts"],
        format: ["cjs"],
        target: "node",
      },
    ],
  },
]);
```

### Working with Workspace Paths

All paths in workspace configurations are resolved relative to each workspace's root directory. This means:

- Entry points are resolved from the workspace root
- Output is generated relative to the workspace root
- TypeScript configurations are loaded from the workspace root

For example, with the following configuration:

```typescript
{
      name: 'my-package',
      root: 'packages/my-package',
      config: {
            entry: ['src/index.ts'],
            outDir: 'dist',
      },
}
```

The entry point will be resolved as `packages/my-package/src/index.ts` and the output will be written to `packages/my-package/dist/`.

### Running Workspace Builds

To build all workspaces, simply run the `bunup` command with no additional arguments:

```sh
bunup
```

Bunup will automatically detect and build all workspaces defined in your configuration file.

To watch the packages in workspaces and automatically rebuild on file changes, run:

```sh
bunup --watch
```

This single command enables continuous monitoring and rebuilding of all packages in your workspaces.
