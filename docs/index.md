# Bunup

An extremely fast, zero-config bundler for TypeScript & JavaScript, powered by [Bun](https://bun.sh) and [oxc](https://oxc.rs/).

<img src="/demo.gif" alt="Demo" style="border-radius: 8px; border: 1px solid rgba(128, 128, 128, 0.2); box-shadow: 0 0 1px rgba(0, 0, 0, 0.1);" />

## Benchmarks

Bunup outperforms other popular bundlers by a significant margin:

| Bundler       | Format   | Build Time  | Relative Speed   |
| ------------- | -------- | ----------- | ---------------- |
| bunup         | esm, cjs | **3.65ms**  | **16.0x faster** |
| bunup (+ dts) | esm, cjs | **36.44ms** | **20.4x faster** |
| tsup          | esm, cjs | 58.36ms     | baseline         |
| tsup (+ dts)  | esm, cjs | 745.23ms    | baseline         |

_Lower build time is better. Benchmark run on the same code with identical output formats._

## What Can It Bundle?

Bunup handles various file types:

- JavaScript/TypeScript (`.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`, `.mts`, `.cts`)
- Data files (`.json`, `.toml`, `.txt`) - Parsed and inlined automatically
- Assets (images, fonts, etc.) - Handled as external files

Powered by Bun for fast parsing, transpilation and bundling.

## Prerequisites

Bunup requires [Bun](https://bun.sh) to be installed on your system. Bun is a fast all-in-one JavaScript runtime that powers Bunup's exceptional performance.

To install Bun, please visit the [official Bun installation page](https://bun.sh/docs/installation).

## Quick Start

Get started with Bunup in seconds - install, configure, and build your TypeScript/JavaScript projects with minimal setup.

### Installation

::: code-group

```bash [npm]
npm install --save-dev bunup
```

```bash [yarn]
yarn add --dev bunup
```

```bash [pnpm]
pnpm add --save-dev bunup
```

```bash [bun]
bun add --dev bunup
```

:::

### Basic Usage

Create a simple TypeScript file:

```typescript
// src/index.ts
export function greet(name: string): string {
    return `Hello, ${name}!`;
}
```

Bundle it with bunup:

```bash
bunup src/index.ts
```

This will create a bundled output in the `dist` directory with CommonJS format (the default).

### Using with package.json

Add a build script to your `package.json`:

```json
{
    "name": "my-package",
    "scripts": {
        "build": "bunup src/index.ts --format esm,cjs --dts"
    }
}
```

Then run:

```bash
npm run build
```

### Configuration File

Create a `bunup.config.ts` file for more control:

```typescript
import {defineConfig} from 'bunup';

export default defineConfig({
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm', 'cjs'],
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
- `bunup.config.json`
- `bunup.config.jsonc`

Example configuration:

```typescript
import {defineConfig} from 'bunup';

export default defineConfig({
    // Name for this build configuration (used in logs)
    name: 'my-library',

    // Entry points (can be an array or object)
    entry: ['src/index.ts', 'src/cli.ts'],

    // Output directory
    outDir: 'dist',

    // Output formats
    format: ['esm', 'cjs'],

    // TypeScript declaration generation
    dts: true,

    // Target environment
    target: 'node',

    // Minification options
    minify: true,

    // External dependencies
    external: ['react', 'react-dom'],

    // Clean output directory before build
    clean: true,
});
```

You can also export an array of configurations:

```typescript
export default defineConfig([
    {
        name: 'node',
        entry: ['src/index.ts'],
        format: ['cjs'],
        target: 'node',
    },
    {
        name: 'browser',
        entry: ['src/index.ts'],
        format: ['esm', 'iife'],
        target: 'browser',
    },
]);
```

## CLI Options

Bunup supports various command-line options:

| Option                  | Alias | Description                                    | Default          |
| ----------------------- | ----- | ---------------------------------------------- | ---------------- |
| `--entry <path>`        |       | Entry file path                                | `[]`             |
| `--entry.<name> <path>` |       | Named entry file path                          | -                |
| `--out-dir <dir>`       | `-o`  | Output directory                               | `dist`           |
| `--format <formats>`    | `-f`  | Output formats (comma-separated: esm,cjs,iife) | `cjs`            |
| `--minify`              | `-m`  | Enable all minification options                | `false`          |
| `--minify-whitespace`   | `-mw` | Minify whitespace                              | `false`          |
| `--minify-identifiers`  | `-mi` | Minify identifiers                             | `false`          |
| `--minify-syntax`       | `-ms` | Minify syntax                                  | `false`          |
| `--watch`               | `-w`  | Watch mode                                     | `false`          |
| `--dts`                 | `-d`  | Generate TypeScript declarations               | `false`          |
| `--external <deps>`     | `-e`  | External dependencies (comma-separated)        | `[]`             |
| `--no-external <deps>`  | `-ne` | Force include dependencies (comma-separated)   | -                |
| `--target <target>`     | `-t`  | Target environment (node, browser, bun)        | `node`           |
| `--clean`               | `-c`  | Clean output directory before build            | `true`           |
| `--splitting`           | `-s`  | Enable code splitting                          | Format dependent |
| `--name <name>`         | `-n`  | Name for this build configuration              | -                |

## Entry Points

Bunup supports multiple ways to define entry points. Entry points are the source files that Bunup will use as starting points for bundling.

### Single Entry Point

The simplest way to define an entry point is to provide a single file path:

```bash
bunup src/index.ts
```

This will generate an output file named after the input file (e.g., `dist/index.js`).

### Multiple Entry Points

You can specify multiple entry points in several ways:

#### Using the CLI with Multiple Positional Arguments

```bash
bunup src/index.ts src/cli.ts
```

This will generate output files named after each input file (e.g., `dist/index.js` and `dist/cli.js`).

#### Using the CLI with --entry Flag Multiple Times

```bash
bunup --entry src/index.ts --entry src/cli.ts
```

This achieves the same result as using positional arguments.

#### Using Named Entries in the CLI

Named entries allow you to specify custom output filenames:

```bash
bunup --entry.main src/index.ts --entry.cli src/cli.ts
```

This will generate output files with the specified names (e.g., `dist/main.js` and `dist/cli.js`).

#### Using a Configuration File with an Array

```typescript
export default defineConfig({
    entry: ['src/index.ts', 'src/cli.ts'],
});
```

This will generate output files named after each input file.

#### Using a Configuration File with Named Entries

```typescript
export default defineConfig({
    entry: {
        main: 'src/index.ts',
        cli: 'src/cli.ts',
        utils: 'src/utils/index.ts',
    },
});
```

This will generate output files with the specified names (e.g., `dist/main.js`, `dist/cli.js`, and `dist/utils.js`).

### Why Use Named Entries?

Named entries are useful when:

1. You want to customize the output filenames
2. Your input filenames don't match your desired output names
3. You have multiple files with the same basename in different directories
4. You want to create a specific public API structure

For example, if you have `src/utils/index.ts` and `src/components/index.ts`, using named entries prevents naming conflicts in the output.

## Output Formats

Bunup supports three output formats:

- **esm**: ECMAScript modules (`.mjs` extension)
- **cjs**: CommonJS modules (`.js` or `.cjs` extension)
- **iife**: Immediately Invoked Function Expression (`.global.js` extension)

You can specify one or more formats:

### In the CLI

```bash
# Single format
bunup src/index.ts --format esm

# Multiple formats (comma-separated, no spaces)
bunup src/index.ts --format esm,cjs,iife
```

### In a Configuration File

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    // Single format
    format: ['esm'],

    // Or multiple formats
    // format: ['esm', 'cjs', 'iife'],
});
```

### Output File Extensions

The file extensions are determined automatically based on the format and your package.json `type` field:

| Format | package.json type: "module" | package.json type: "commonjs" or unspecified |
| ------ | --------------------------- | -------------------------------------------- |
| esm    | `.mjs`                      | `.mjs`                                       |
| cjs    | `.cjs`                      | `.js`                                        |
| iife   | `.global.js`                | `.global.js`                                 |

## TypeScript Declarations

Bunup can generate TypeScript declaration files (`.d.ts`) for your code:

### Basic Declaration Generation

To generate declarations for all entry points:

```bash
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
    entry: ['src/index.ts', 'src/cli.ts'],
    dts: {
        // Only generate declarations for index.ts
        entry: ['src/index.ts'],
    },
});
```

### Named Declaration Entries

You can use named entries for declarations:

```typescript
export default defineConfig({
    entry: {
        main: 'src/index.ts',
        cli: 'src/cli.ts',
    },
    dts: {
        entry: {
            // Generate types.d.ts from index.ts
            types: 'src/index.ts',
        },
    },
});
```

### Custom TypeScript Configuration

You can specify a custom tsconfig file for declaration generation:

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,
    preferredTsconfigPath: './tsconfig.build.json',
});
```

### Declaration File Extensions

Declaration file extensions follow the same pattern as JavaScript files:

| Format | package.json type: "module" | package.json type: "commonjs" or unspecified |
| ------ | --------------------------- | -------------------------------------------- |
| esm    | `.d.mts`                    | `.d.mts`                                     |
| cjs    | `.d.cts`                    | `.d.ts`                                      |
| iife   | `.d.ts`                     | `.d.ts`                                      |

## External Dependencies

By default, Bunup treats all dependencies from your `package.json` (`dependencies` and `peerDependencies`) as external. This means they won't be included in your bundle.

### Specifying External Dependencies

You can explicitly mark additional packages as external:

#### In the CLI

```bash
# Single external dependency
bunup src/index.ts --external lodash

# Multiple external dependencies (comma-separated, no spaces)
bunup src/index.ts --external lodash,react,react-dom
```

#### In a Configuration File

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    external: ['lodash', 'react', '@some/package'],
});
```

### Including Specific External Dependencies

You can force include specific dependencies that would otherwise be external:

#### In the CLI

```bash
bunup src/index.ts --external lodash --no-external lodash/merge
```

#### In a Configuration File

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    external: ['lodash'],
    noExternal: ['lodash/merge'], // Include lodash/merge even though lodash is external
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

```bash
# Enable code splitting
bunup src/index.ts --splitting

# Disable code splitting
bunup src/index.ts --splitting=false
```

#### In a Configuration File

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
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

```bash
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

```bash
# Minify whitespace only
bunup src/index.ts --minify-whitespace

# Minify whitespace and syntax, but not identifiers
bunup src/index.ts --minify-whitespace --minify-syntax
```

#### In a Configuration File

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    // Configure individual options
    minifyWhitespace: true,
    minifyIdentifiers: false,
    minifySyntax: true,
});
```

The `minify` option is a shorthand that enables all three specific options. If you set individual options, they take precedence over the `minify` setting.

## Watch Mode

Bunup can watch your files for changes and rebuild automatically:

```bash
# CLI
bunup src/index.ts --watch

# Configuration file
export default defineConfig({
    entry: ['src/index.ts'],
    watch: true,
});
```

In watch mode, Bunup will monitor your source files and their dependencies, rebuilding only what's necessary when files change.

## Target Environments

Bunup allows you to specify the target environment for your bundle:

```bash
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

## Output Directory

You can specify where Bunup should output the bundled files:

```bash
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

```bash
# CLI
bunup src/index.ts --clean=false

# Configuration file
export default defineConfig({
    entry: ['src/index.ts'],
    clean: false,
});
```

## Named Configurations

You can give your build configurations names for better logging:

```bash
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
        name: 'node-build',
        entry: ['src/index.ts'],
        format: ['cjs'],
        target: 'node',
    },
    {
        name: 'browser-build',
        entry: ['src/index.ts'],
        format: ['esm', 'iife'],
        target: 'browser',
    },
]);
```
