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

## Prerequisites

Bunup requires [Bun](https://bun.sh) to be installed on your system. Bun is a fast all-in-one JavaScript runtime that powers Bunup's exceptional performance. Without Bun, Bunup cannot execute as it leverages Bun's bundling capabilities and runtime environment.

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

This will create a bundled output in the `dist` directory.

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

Examples:

```bash
# Basic usage
bunup src/index.ts

# Multiple formats with TypeScript declarations
bunup src/index.ts --format esm,cjs --dts

# Named entries
bunup --entry.main src/index.ts --entry.cli src/cli.ts

# Watch mode
bunup src/index.ts --watch
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
bunup src/index.ts --watch
```

In watch mode, Bunup will monitor your source files and their dependencies, rebuilding only what's necessary when files change.
