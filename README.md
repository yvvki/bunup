# Bunup

A extremely fast, zero-config bundler for TypeScript & JavaScript, powered by [Bun](https://bun.sh) and [oxc](https://oxc.rs/).

![Demo](/demo.gif)

## Benchmarks

Bunup outperforms other popular bundlers by a significant margin:

| Bundler       | Format   | Build Time  | Relative Speed   |
| ------------- | -------- | ----------- | ---------------- |
| bunup         | esm, cjs | **3.65ms**  | **16.0x faster** |
| bunup (+ dts) | esm, cjs | **36.44ms** | **20.4x faster** |
| tsup          | esm, cjs | 58.36ms     | baseline         |
| tsup (+ dts)  | esm, cjs | 745.23ms    | baseline         |

_Lower build time is better. Benchmark run on the same code with identical output formats._

## Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration](#configuration)
    - [Configuration File](#configuration-file)
    - [CLI Options](#cli-options)
3. [Entry Points](#entry-points)
4. [Output Formats](#output-formats)
5. [TypeScript Declarations](#typescript-declarations)
6. [External Dependencies](#external-dependencies)
7. [Code Splitting](#code-splitting)
8. [Minification](#minification)
9. [Watch Mode](#watch-mode)
10. [API Reference](#api-reference)
11. [Examples](#examples)

## Quick Start

### Installation

```bash
# Install bunup
npm install --save-dev bunup

# Or with yarn
yarn add --dev bunup

# Or with pnpm
pnpm add --save-dev bunup

# Or with bun
bun add --dev bunup
```

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
bunup --entry src/index.ts
```

This will create a bundled output in the `dist` directory.

### Using with package.json

Add a build script to your `package.json`:

```json
{
    "name": "my-package",
    "scripts": {
        "build": "bunup --entry src/index.ts --format esm,cjs --dts"
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

### CLI Options

Bunup supports various command-line options:

| Option                  | Alias | Description                                    |
| ----------------------- | ----- | ---------------------------------------------- |
| `--entry <path>`        |       | Entry file path                                |
| `--entry.<name> <path>` |       | Named entry file path                          |
| `--out-dir <dir>`       | `-o`  | Output directory                               |
| `--format <formats>`    | `-f`  | Output formats (comma-separated: esm,cjs,iife) |
| `--minify`              | `-m`  | Enable all minification options                |
| `--minify-whitespace`   | `-mw` | Minify whitespace                              |
| `--minify-identifiers`  | `-mi` | Minify identifiers                             |
| `--minify-syntax`       | `-ms` | Minify syntax                                  |
| `--watch`               | `-w`  | Watch mode                                     |
| `--dts`                 | `-d`  | Generate TypeScript declarations               |
| `--external <deps>`     | `-e`  | External dependencies (comma-separated)        |
| `--no-external <deps>`  | `-ne` | Force include dependencies (comma-separated)   |
| `--target <target>`     | `-t`  | Target environment (node, browser, bun)        |
| `--clean`               | `-c`  | Clean output directory before build            |
| `--splitting`           | `-s`  | Enable code splitting                          |
| `--name <name>`         | `-n`  | Name for this build configuration              |

Examples:

```bash
# Basic usage
bunup --entry src/index.ts

# Multiple formats with TypeScript declarations
bunup --entry src/index.ts --format esm,cjs --dts

# Named entries
bunup --entry.main src/index.ts --entry.cli src/cli.ts

# Watch mode
bunup --entry src/index.ts --watch
```

## Entry Points

Bunup supports multiple ways to define entry points:

### Array of Paths

```typescript
export default defineConfig({
    entry: ['src/index.ts', 'src/cli.ts'],
});
```

This will generate output files named after the input files (e.g., `index.js` and `cli.js`).

### Named Entries

```typescript
export default defineConfig({
    entry: {
        main: 'src/index.ts',
        cli: 'src/cli.ts',
        utils: 'src/utils/index.ts',
    },
});
```

This will generate output files with the specified names (e.g., `main.js`, `cli.js`, and `utils.js`).

## Output Formats

Bunup supports three output formats:

- **esm**: ECMAScript modules (`.mjs` extension)
- **cjs**: CommonJS modules (`.js` or `.cjs` extension)
- **iife**: Immediately Invoked Function Expression (`.global.js` extension)

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs', 'iife'],
});
```

The file extensions are determined automatically based on the format and your package.json `type` field:

| Format | package.json type: "module" | package.json type: "commonjs" or unspecified |
| ------ | --------------------------- | -------------------------------------------- |
| esm    | `.mjs`                      | `.mjs`                                       |
| cjs    | `.cjs`                      | `.js`                                        |
| iife   | `.global.js`                | `.global.js`                                 |

## TypeScript Declarations

Bunup can generate TypeScript declaration files (`.d.ts`) for your code:

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,
});
```

For more control, you can specify custom entry points for declarations:

```typescript
export default defineConfig({
    entry: ['src/index.ts', 'src/cli.ts'],
    dts: {
        entry: ['src/index.ts'], // Only generate declarations for index.ts
    },
});
```

Or use named entries:

```typescript
export default defineConfig({
    entry: {
        main: 'src/index.ts',
        cli: 'src/cli.ts',
    },
    dts: {
        entry: {
            types: 'src/index.ts', // Generate types.d.ts from index.ts
        },
    },
});
```

You can also specify a custom tsconfig file for declaration generation:

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    dts: true,
    preferredTsconfigPath: './tsconfig.build.json',
});
```

Declaration file extensions follow the same pattern as JavaScript files:

| Format | package.json type: "module" | package.json type: "commonjs" or unspecified |
| ------ | --------------------------- | -------------------------------------------- |
| esm    | `.d.mts`                    | `.d.mts`                                     |
| cjs    | `.d.cts`                    | `.d.ts`                                      |
| iife   | `.d.ts`                     | `.d.ts`                                      |

## External Dependencies

By default, Bunup treats all dependencies from your `package.json` (`dependencies` and `peerDependencies`) as external. This means they won't be included in your bundle.

You can explicitly mark additional packages as external:

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    external: ['lodash', 'react', '@some/package'],
});
```

You can also force include specific dependencies that would otherwise be external:

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    external: ['lodash'],
    noExternal: ['lodash/merge'], // Include lodash/merge even though lodash is external
});
```

Both `external` and `noExternal` support string patterns and regular expressions.

## Code Splitting

Bunup supports code splitting for the ESM format:

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    splitting: true, // Default is true for ESM
});
```

Code splitting is enabled by default for ESM format and disabled for CJS and IIFE formats. You can explicitly enable or disable it:

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    splitting: false, // Disable code splitting for all formats
});
```

## Minification

Bunup provides several minification options:

```typescript
export default defineConfig({
    entry: ['src/index.ts'],

    // Enable all minification options
    minify: true,

    // Or configure individual options
    minifyWhitespace: true,
    minifyIdentifiers: false,
    minifySyntax: true,
});
```

The `minify` option is a shorthand that enables all three specific options. If you set individual options, they take precedence over the `minify` setting.

## Watch Mode

Bunup can watch your files for changes and rebuild automatically:

```typescript
export default defineConfig({
    entry: ['src/index.ts'],
    watch: true,
});
```

Or use the CLI flag:

```bash
bunup --entry src/index.ts --watch
```

In watch mode, Bunup will monitor your source files and their dependencies, rebuilding only what's necessary when files change.

## API Reference

### BunupOptions

The complete configuration options interface:

```typescript
interface BunupOptions {
    /**
     * Name of the build configuration
     * Used for logging and identification purposes
     */
    name?: string;

    /**
     * Entry point files for the build
     * Can be an array of file paths or an object with named entries
     */
    entry: string[] | Record<string, string>;

    /**
     * Output directory for the bundled files
     * Defaults to 'dist'
     */
    outDir: string;

    /**
     * Output formats for the bundle
     * Can include 'esm', 'cjs', and/or 'iife'
     * Defaults to ['cjs']
     */
    format: ('esm' | 'cjs' | 'iife')[];

    /**
     * Whether to enable all minification options
     */
    minify?: boolean;

    /**
     * Whether to enable code splitting
     * Defaults to true for ESM format, false for CJS format
     */
    splitting?: boolean;

    /**
     * Whether to minify whitespace in the output
     */
    minifyWhitespace?: boolean;

    /**
     * Whether to minify identifiers in the output
     */
    minifyIdentifiers?: boolean;

    /**
     * Whether to minify syntax in the output
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
    dts?:
        | boolean
        | {
              entry: string[] | Record<string, string>;
          };

    /**
     * Path to a preferred tsconfig.json file to use for declaration generation
     */
    preferredTsconfigPath?: string;

    /**
     * External packages that should not be bundled
     */
    external?: string[];

    /**
     * Packages that should be bundled even if they are in external
     */
    noExternal?: string[];

    /**
     * The target environment for the bundle
     * Can be 'browser', 'bun', 'node'
     * Defaults to 'node'
     */
    target?: 'browser' | 'bun' | 'node';

    /**
     * Whether to clean the output directory before building
     * Defaults to true
     */
    clean?: boolean;
}
```

### Default Options

```typescript
const DEFAULT_OPTIONS = {
    entry: [],
    format: ['cjs'],
    outDir: 'dist',
    minify: false,
    watch: false,
    dts: false,
    target: 'node',
    external: [],
    clean: true,
};
```

## Examples

### Basic Library

```typescript
// bunup.config.ts
import {defineConfig} from 'bunup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
});
```

### Multiple Entry Points

```typescript
// bunup.config.ts
import {defineConfig} from 'bunup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        cli: 'src/cli.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
});
```

### Browser and Node Targets

```typescript
// bunup.config.ts
import {defineConfig} from 'bunup';

export default defineConfig([
    {
        name: 'node',
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
        target: 'node',
        outDir: 'dist/node',
    },
    {
        name: 'browser',
        entry: ['src/index.ts'],
        format: ['esm', 'iife'],
        target: 'browser',
        outDir: 'dist/browser',
    },
]);
```

### With Minification

```typescript
// bunup.config.ts
import {defineConfig} from 'bunup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    minify: true,
    dts: true,
});
```
